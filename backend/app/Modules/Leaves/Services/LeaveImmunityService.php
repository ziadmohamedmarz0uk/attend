<?php

namespace App\Modules\Leaves\Services;

use App\Modules\Leaves\Models\LeaveRequest;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use Exception;
use DateTime;

/**
 * Class LeaveImmunityService
 * 
 * Manages automated leave immunity verification and shields employees on approved leaves
 * from absence penalties, Black points, and late Red point deductions.
 * 
 * @package App\Modules\Leaves\Services
 */
class LeaveImmunityService
{
    /**
     * Checks if an employee has an approved leave shielding them on a specific target date.
     *
     * @param int $userId Employee ID
     * @param string|DateTime $targetDate Date to verify (Format: YYYY-MM-DD or DateTime object)
     * @return array Immunity status, leave details, and protective diagnostic message
     */
    public function isEmployeeImmuneOnDate(int $userId, $targetDate): array
    {
        try {
            $dateStr = $targetDate instanceof DateTime ? $targetDate->format('Y-m-d') : (string) $targetDate;

            // Query active approved leaves covering the target date
            $approvedLeave = LeaveRequest::where('user_id', $userId)
                ->where('status', 'approved')
                ->where('start_date', '<=', $dateStr)
                ->where('end_date', '>=', $dateStr)
                ->first();

            if ($approvedLeave) {
                return [
                    'is_immune' => true,
                    'shield_active' => true,
                    'leave_id' => $approvedLeave->id,
                    'start_date' => $approvedLeave->start_date,
                    'end_date' => $approvedLeave->end_date,
                    'reason' => $approvedLeave->reason,
                    'message' => "Automated Leave Immunity Active! Employee is shielded from penalties on {$dateStr} due to approved leave: \"{$approvedLeave->reason}\".",
                ];
            }

            return [
                'is_immune' => false,
                'shield_active' => false,
                'leave_id' => null,
                'start_date' => null,
                'end_date' => null,
                'reason' => null,
                'message' => "No active approved leave immunity found for employee on {$dateStr}.",
            ];
        } catch (Exception $e) {
            return [
                'is_immune' => false,
                'shield_active' => false,
                'leave_id' => null,
                'reason' => null,
                'message' => 'Exception evaluating leave immunity: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Shields employee from penalty assignment and verifies if attendance action should be excused.
     *
     * @param int $userId
     * @param string|DateTime $targetDate
     * @return bool True if immune and shielded, false otherwise
     */
    public function shieldFromPenalties(int $userId, $targetDate): bool
    {
        $immunityCheck = $this->isEmployeeImmuneOnDate($userId, $targetDate);
        return $immunityCheck['is_immune'];
    }

    /**
     * Validates whether a new leave request date range overlaps with existing pending or approved requests.
     *
     * @param int $userId
     * @param string $startDate (YYYY-MM-DD)
     * @param string $endDate (YYYY-MM-DD)
     * @param int|null $ignoreLeaveId Optional ID of leave request to ignore (for updates)
     * @return array Overlap validation result
     */
    public function checkLeaveDateOverlap(int $userId, string $startDate, string $endDate, ?int $ignoreLeaveId = null): array
    {
        if (new DateTime($startDate) > new DateTime($endDate)) {
            throw new InvalidArgumentException('Leave start date cannot be after end date.');
        }

        $query = LeaveRequest::where('user_id', $userId)
            ->whereIn('status', ['pending', 'approved'])
            ->where(function ($q) use ($startDate, $endDate) {
                $q->whereBetween('start_date', [$startDate, $endDate])
                  ->orWhereBetween('end_date', [$startDate, $endDate])
                  ->orWhere(function ($sub) use ($startDate, $endDate) {
                      $sub->where('start_date', '<=', $startDate)
                          ->where('end_date', '>=', $endDate);
                  });
            });

        if ($ignoreLeaveId) {
            $query->where('id', '!=', $ignoreLeaveId);
        }

        $overlappingLeave = $query->first();

        if ($overlappingLeave) {
            return [
                'has_overlap' => true,
                'overlapping_leave_id' => $overlappingLeave->id,
                'overlapping_status' => $overlappingLeave->status,
                'message' => "Requested date range overlaps with an existing {$overlappingLeave->status} leave request ({$overlappingLeave->start_date} to {$overlappingLeave->end_date}).",
            ];
        }

        return [
            'has_overlap' => false,
            'overlapping_leave_id' => null,
            'overlapping_status' => null,
            'message' => 'Date range is clear and free of overlaps.',
        ];
    }
}
