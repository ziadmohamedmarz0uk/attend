<?php

namespace App\Modules\Attendance\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Modules\Attendance\Services\GeofenceService;
use App\Modules\Attendance\Models\AttendanceLog;
use App\Modules\Leaves\Services\LeaveImmunityService;
use App\Modules\Points\Services\PointsEngineService;
use App\Modules\Auth\Models\User;
use Exception;
use DateTime;

/**
 * Class AttendanceController
 * 
 * Production Controller handling employee GPS Geofenced Check-in,
 * Automated Leave Immunity integration, Traffic Light points classification,
 * and financial penalty enforcement.
 * 
 * @package App\Modules\Attendance\Controllers
 */
class AttendanceController extends Controller
{
    private GeofenceService $geofenceService;
    private LeaveImmunityService $leaveImmunityService;
    private PointsEngineService $pointsEngineService;

    public function __construct(
        GeofenceService $geofenceService,
        LeaveImmunityService $leaveImmunityService,
        PointsEngineService $pointsEngineService
    ) {
        $this->geofenceService = $geofenceService;
        $this->leaveImmunityService = $leaveImmunityService;
        $this->pointsEngineService = $pointsEngineService;
    }

    /**
     * Handles employee GPS Geofenced Check-in request.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function checkIn(Request $request): JsonResponse
    {
        // 1. Validate Input Data
        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'gps_accuracy' => 'nullable|numeric|min:0',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $userId = $validated['user_id'] ?? auth()->id();
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized or missing employee identity.',
            ], 401);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Employee record not found.',
            ], 404);
        }

        $now = new DateTime();
        $todayDate = $now->format('Y-m-d');
        $currentTimeStr = $now->format('H:i:s');

        try {
            return DB::transaction(function () use ($user, $validated, $todayDate, $currentTimeStr, $now) {
                // 2. Prevent Duplicate Check-in for today
                $alreadyCheckedIn = AttendanceLog::where('user_id', $user->id)
                    ->whereDate('check_in_time', $todayDate)
                    ->exists();

                if ($alreadyCheckedIn) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Duplicate Check-in: You have already recorded attendance for today.',
                    ], 409);
                }

                // 3. Service Integration 1: Check Leave Immunity Shield
                $immunityCheck = $this->leaveImmunityService->isEmployeeImmuneOnDate($user->id, $todayDate);
                if ($immunityCheck['is_immune']) {
                    // Record excused attendance log without penalties
                    $log = AttendanceLog::create([
                        'user_id' => $user->id,
                        'check_in_time' => $now->format('Y-m-d H:i:s'),
                        'latitude' => (float)$validated['latitude'],
                        'longitude' => (float)$validated['longitude'],
                        'point_type' => 'none',
                        'is_excused' => true,
                    ]);

                    return response()->json([
                        'success' => true,
                        'is_excused' => true,
                        'message' => $immunityCheck['message'],
                        'data' => [
                            'log_id' => $log->id,
                            'status' => 'EXCUSED',
                            'point_type' => 'none',
                            'leave_reason' => $immunityCheck['reason'],
                        ],
                    ], 200);
                }

                // 4. Service Integration 2: GPS Geofence & Anti-Spoofing Verification
                $geofenceResult = $this->geofenceService->verifyGeofence(
                    (float)$validated['latitude'],
                    (float)$validated['longitude'],
                    isset($validated['gps_accuracy']) ? (float)$validated['gps_accuracy'] : null,
                    $user
                );

                if (!$geofenceResult['is_valid'] || !$geofenceResult['is_inside_geofence']) {
                    return response()->json([
                        'success' => false,
                        'message' => $geofenceResult['reason'],
                        'data' => [
                            'distance_meters' => $geofenceResult['distance_meters'],
                            'allowed_radius_meters' => $geofenceResult['allowed_radius_meters'],
                            'gps_accuracy_meters' => $geofenceResult['gps_accuracy_meters'],
                        ],
                    ], 403);
                }

                // 5. Service Integration 3: Traffic Light Time Evaluation
                $timeEvaluation = $this->pointsEngineService->evaluateCheckInTime($currentTimeStr);

                // Hard Cutoff check (>= 12:00 PM)
                if ($timeEvaluation['status'] === 'BLACK') {
                    return response()->json([
                        'success' => false,
                        'message' => $timeEvaluation['message'],
                    ], 403);
                }

                // 6. Record Points Transaction & Financial Penalties in Ledger
                $pointType = $timeEvaluation['point_type']; // 'green' or 'red'
                $financialImpact = $timeEvaluation['financial_impact'];

                $this->pointsEngineService->recordPointTransaction(
                    $user->id,
                    $pointType,
                    $financialImpact,
                    "Attendance check-in recorded at {$currentTimeStr} ({$timeEvaluation['status']})"
                );

                // 7. Check if Early Arrival qualifies for 5-day streak progression
                $streakMessage = '';
                if ($timeEvaluation['is_early'] && $timeEvaluation['qualifies_for_black_redemption']) {
                    $streakResult = $this->pointsEngineService->processBlackPointRedemptionStreak($user);
                    $streakMessage = ' ' . $streakResult['message'];
                }

                // 8. Create Attendance Log Record
                $attendanceLog = AttendanceLog::create([
                    'user_id' => $user->id,
                    'check_in_time' => $now->format('Y-m-d H:i:s'),
                    'latitude' => (float)$validated['latitude'],
                    'longitude' => (float)$validated['longitude'],
                    'point_type' => $pointType,
                    'is_excused' => false,
                ]);

                $freshUser = User::find($user->id);

                return response()->json([
                    'success' => true,
                    'message' => $timeEvaluation['message'] . $streakMessage,
                    'data' => [
                        'log' => $attendanceLog,
                        'user_points' => [
                            'green_points' => $freshUser->green_points ?? 0,
                            'red_points' => $freshUser->red_points ?? 0,
                            'black_points' => $freshUser->black_points ?? 0,
                            'early_credits' => $freshUser->early_green_credits ?? 0,
                            'financial_balance' => $freshUser->financial_balance ?? 0,
                        ],
                    ],
                ], 200);
            });
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error during check-in processing: ' . $e->getMessage(),
            ], 500);
        }
    }
}
