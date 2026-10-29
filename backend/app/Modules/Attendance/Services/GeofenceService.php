<?php

namespace App\Modules\Attendance\Services;

use InvalidArgumentException;
use Exception;
use App\Modules\OwnerControl\Models\Branch;
use App\Modules\Auth\Models\User;

/**
 * Class GeofenceService
 * 
 * Handles dynamic GPS Geofencing verification against registered company locations/branches,
 * distance calculation using the Haversine formula, and anti-spoofing validation for employee check-ins.
 * 
 * @package App\Modules\Attendance\Services
 */
class GeofenceService
{
    /**
     * Mean Earth radius in meters.
     */
    private const EARTH_RADIUS_METERS = 6371000.0;

    /**
     * Fallback Company HQ default coordinates and thresholds (if database has no branches).
     */
    private float $fallbackLat;
    private float $fallbackLng;
    private float $fallbackRadiusMeters;
    private float $maxGpsAccuracyMeters;

    /**
     * GeofenceService constructor.
     */
    public function __construct()
    {
        $this->fallbackLat = (float) config('geofence.company_lat', env('COMPANY_LATITUDE', env('COMPANY_LAT', 30.044420)));
        $this->fallbackLng = (float) config('geofence.company_lng', env('COMPANY_LONGITUDE', env('COMPANY_LNG', 31.235712)));
        $this->fallbackRadiusMeters = (float) config('geofence.allowed_radius_meters', env('GEOFENCE_RADIUS_METERS', 100.0));
        $this->maxGpsAccuracyMeters = (float) config('geofence.max_gps_accuracy_meters', env('MAX_ALLOWED_GPS_ACCURACY_METERS', 50.0));
    }

    /**
     * Calculates the exact distance in meters between two GPS coordinates using the Haversine Formula.
     *
     * @param float $latitude1 Latitude of starting point
     * @param float $longitude1 Longitude of starting point
     * @param float $latitude2 Latitude of destination point
     * @param float $longitude2 Longitude of destination point
     * @return float Distance in meters rounded to 2 decimal places
     * @throws InvalidArgumentException If coordinates are out of valid range (-90..90, -180..180)
     */
    public function calculateDistance(float $latitude1, float $longitude1, float $latitude2, float $longitude2): float
    {
        if ($latitude1 < -90 || $latitude1 > 90 || $latitude2 < -90 || $latitude2 > 90) {
            throw new InvalidArgumentException('Latitude value must be between -90 and 90 degrees.');
        }

        if ($longitude1 < -180 || $longitude1 > 180 || $longitude2 < -180 || $longitude2 > 180) {
            throw new InvalidArgumentException('Longitude value must be between -180 and 180 degrees.');
        }

        // Convert degrees to radians
        $lat1Rad = deg2rad($latitude1);
        $lat2Rad = deg2rad($latitude2);
        $deltaLatRad = deg2rad($latitude2 - $latitude1);
        $deltaLngRad = deg2rad($longitude2 - $longitude1);

        // Haversine formula calculation
        $a = sin($deltaLatRad / 2) * sin($deltaLatRad / 2) +
             cos($lat1Rad) * cos($lat2Rad) *
             sin($deltaLngRad / 2) * sin($deltaLngRad / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        $distance = self::EARTH_RADIUS_METERS * $c;

        return round($distance, 2);
    }

    /**
     * Validates whether an employee's GPS location is within the allowed company geofence radius.
     * Checks employee assigned branch, or finds the closest active branch dynamically from database.
     *
     * @param float $userLat Employee latitude
     * @param float $userLng Employee longitude
     * @param float|null $gpsAccuracy Optional GPS accuracy in meters reported by device
     * @param User|null $user Optional employee record to check specific branch assignment
     * @return array Result containing boolean status, calculated distance, and diagnostic messages
     */
    public function verifyGeofence(float $userLat, float $userLng, ?float $gpsAccuracy = null, ?User $user = null): array
    {
        try {
            // 1. Anti-Spoofing Check: Validate GPS Accuracy Threshold
            if ($gpsAccuracy !== null && $gpsAccuracy > $this->maxGpsAccuracyMeters) {
                return [
                    'is_valid' => false,
                    'is_inside_geofence' => false,
                    'distance_meters' => 0.0,
                    'allowed_radius_meters' => $this->fallbackRadiusMeters,
                    'gps_accuracy_meters' => $gpsAccuracy,
                    'branch_name' => null,
                    'reason' => "دقة إشارة الـ GPS ضعيفة جداً ({$gpsAccuracy}m > الحد المسموح {$this->maxGpsAccuracyMeters}m). يرجى التواجد في مكان مفتوح والتأكد من إشارة الـ GPS لمنع التلاعب.",
                ];
            }

            // 2. Fetch Target Branch or List of Active Branches
            $activeBranches = Branch::where('is_active', true)->get();

            // Case A: User has a specific assigned branch
            if ($user && $user->branch_id) {
                $assignedBranch = $activeBranches->firstWhere('id', $user->branch_id);
                if ($assignedBranch) {
                    $distance = $this->calculateDistance($userLat, $userLng, $assignedBranch->latitude, $assignedBranch->longitude);
                    $isInside = $distance <= $assignedBranch->radius_meters;

                    return [
                        'is_valid' => true,
                        'is_inside_geofence' => $isInside,
                        'distance_meters' => $distance,
                        'allowed_radius_meters' => (float)$assignedBranch->radius_meters,
                        'gps_accuracy_meters' => $gpsAccuracy,
                        'branch_name' => $assignedBranch->name,
                        'branch_id' => $assignedBranch->id,
                        'reason' => $isInside
                            ? "الموظف داخل نطاق الفرع المخصص ({$assignedBranch->name}) - المسافة: {$distance}م."
                            : "الموظف خارج نطاق الفرع المخصص ({$assignedBranch->name}). المسافة الحالية: {$distance}م (المسموح: {$assignedBranch->radius_meters}م).",
                    ];
                }
            }

            // Case B: Check against all active branches and match the closest one
            if ($activeBranches->isNotEmpty()) {
                $closestBranch = null;
                $minDistance = null;

                foreach ($activeBranches as $branch) {
                    $dist = $this->calculateDistance($userLat, $userLng, $branch->latitude, $branch->longitude);
                    if ($minDistance === null || $dist < $minDistance) {
                        $minDistance = $dist;
                        $closestBranch = $branch;
                    }
                }

                if ($closestBranch) {
                    $isInside = $minDistance <= $closestBranch->radius_meters;
                    return [
                        'is_valid' => true,
                        'is_inside_geofence' => $isInside,
                        'distance_meters' => $minDistance,
                        'allowed_radius_meters' => (float)$closestBranch->radius_meters,
                        'gps_accuracy_meters' => $gpsAccuracy,
                        'branch_name' => $closestBranch->name,
                        'branch_id' => $closestBranch->id,
                        'reason' => $isInside
                            ? "الموظف داخل نطاق ({$closestBranch->name}) - المسافة: {$minDistance}م."
                            : "الموظف خارج النطاق الجغرافي. أقرب موقع: {$closestBranch->name} بمسافة {$minDistance}م (المسموح: {$closestBranch->radius_meters}م).",
                    ];
                }
            }

            // Case C: Fallback to .env defaults if no branches exist in database
            $distance = $this->calculateDistance($userLat, $userLng, $this->fallbackLat, $this->fallbackLng);
            $isInside = $distance <= $this->fallbackRadiusMeters;

            return [
                'is_valid' => true,
                'is_inside_geofence' => $isInside,
                'distance_meters' => $distance,
                'allowed_radius_meters' => $this->fallbackRadiusMeters,
                'gps_accuracy_meters' => $gpsAccuracy,
                'branch_name' => 'المقر الرئيسي (افتراضي)',
                'branch_id' => null,
                'reason' => $isInside
                    ? "الموظف داخل نطاق الشركة ({$distance}م <= {$this->fallbackRadiusMeters}م)."
                    : "خارج النطاق الجغرافي المسموح. المسافة: {$distance}م (المسموح: {$this->fallbackRadiusMeters}م).",
            ];
        } catch (InvalidArgumentException $e) {
            return [
                'is_valid' => false,
                'is_inside_geofence' => false,
                'distance_meters' => 0.0,
                'allowed_radius_meters' => $this->fallbackRadiusMeters,
                'gps_accuracy_meters' => $gpsAccuracy,
                'branch_name' => null,
                'reason' => 'إحداثيات GPS غير صالحة: ' . $e->getMessage(),
            ];
        } catch (Exception $e) {
            return [
                'is_valid' => false,
                'is_inside_geofence' => false,
                'distance_meters' => 0.0,
                'allowed_radius_meters' => $this->fallbackRadiusMeters,
                'gps_accuracy_meters' => $gpsAccuracy,
                'branch_name' => null,
                'reason' => 'خطأ في حساب النطاق الجغرافي: ' . $e->getMessage(),
            ];
        }
    }
}
