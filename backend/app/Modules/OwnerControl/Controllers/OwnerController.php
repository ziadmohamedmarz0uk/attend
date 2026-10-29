<?php

namespace App\Modules\OwnerControl\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Modules\Auth\Models\User;
use App\Modules\Attendance\Models\AttendanceLog;
use App\Modules\Leaves\Models\LeaveRequest;
use App\Modules\Points\Models\PointsLedger;
use App\Modules\OwnerControl\Models\AuditLog;
use InvalidArgumentException;
use Exception;

/**
 * Class OwnerController
 * 
 * Production Controller providing Executive Control Center analytics,
 * Owner manual financial & points overrides with mandatory audit logging,
 * and system timeline audit trail inspection.
 * 
 * @package App\Modules\OwnerControl\Controllers
 */
class OwnerController extends Controller
{
    /**
     * Checks if the current user has Owner role privileges.
     *
     * @return bool
     */
    private function isOwner(): bool
    {
        $user = auth()->user();
        if ($user && $user->role !== 'owner') {
            return false;
        }
        return true;
    }

    /**
     * Returns comprehensive executive dashboard analytics.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getDashboardStats(Request $request): JsonResponse
    {
        if (!$this->isOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden: Owner role required.',
            ], 403);
        }

        try {
            $employees = User::where('role', 'employee')->get();
            $totalLogsCount = AttendanceLog::count();
            $onTimeLogsCount = AttendanceLog::where('point_type', 'green')->count();

            $punctualityRate = $totalLogsCount > 0
                ? round(($onTimeLogsCount / $totalLogsCount) * 100, 1)
                : 100.0;

            $stats = [
                'total_employees' => $employees->count(),
                'punctuality_rate' => $punctualityRate,
                'total_green_points' => (int) $employees->sum('green_points'),
                'total_red_points' => (int) $employees->sum('red_points'),
                'total_black_points' => (int) $employees->sum('black_points'),
                'total_financial_balance_egp' => (float) $employees->sum('financial_balance'),
                'total_bonuses_disbursed_egp' => (float) PointsLedger::where('description', 'LIKE', '%Monthly Commitment Bonus%')->sum('amount_deducted_or_rewarded'),
                'pending_leaves_count' => LeaveRequest::where('status', 'pending')->count(),
            ];

            $recentLogs = AttendanceLog::with('user:id,name,email,department')
                ->latest()
                ->take(10)
                ->get();

            $pendingLeaves = LeaveRequest::with('user:id,name,email,department')
                ->where('status', 'pending')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => $stats,
                    'employees' => $employees,
                    'recent_logs' => $recentLogs,
                    'pending_leaves' => $pendingLeaves,
                ],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error fetching owner dashboard analytics: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Applies manual financial & points override to an employee with mandatory audit reason logging.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function manualOverride(Request $request): JsonResponse
    {
        if (!$this->isOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden: Owner role required.',
            ], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount_egp' => 'nullable|numeric',
            'add_green' => 'nullable|integer',
            'add_red' => 'nullable|integer',
            'add_black' => 'nullable|integer',
            'add_early_credits' => 'nullable|integer',
            'reason' => 'required|string|min:5|max:1000',
        ]);

        try {
            return DB::transaction(function () use ($validated) {
                $employee = User::where('id', $validated['user_id'])
                    ->lockForUpdate()
                    ->first();

                if (!$employee) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Employee record not found.',
                    ], 404);
                }

                $amountEgp = (float)($validated['amount_egp'] ?? 0);
                $addGreen = (int)($validated['add_green'] ?? 0);
                $addRed = (int)($validated['add_red'] ?? 0);
                $addBlack = (int)($validated['add_black'] ?? 0);
                $addEarlyCredits = (int)($validated['add_early_credits'] ?? 0);

                // Update employee points and financial balance
                $employee->financial_balance = ($employee->financial_balance ?? 0.0) + $amountEgp;
                $employee->green_points = max(0, ($employee->green_points ?? 0) + $addGreen);
                $employee->red_points = max(0, ($employee->red_points ?? 0) + $addRed);
                $employee->black_points = max(0, ($employee->black_points ?? 0) + $addBlack);
                $employee->early_green_credits = max(0, ($employee->early_green_credits ?? 0) + $addEarlyCredits);
                $employee->save();

                $ownerName = auth()->user() ? auth()->user()->name : 'Owner';

                // Record Audit Log entry
                $auditDetails = "Manual Override applied to {$employee->name}: Amount: {$amountEgp} EGP, Points [G:{$addGreen}, R:{$addRed}, B:{$addBlack}], Reason: \"{$validated['reason']}\"";
                
                AuditLog::create([
                    'action' => 'MANUAL_OVERRIDE',
                    'details' => $auditDetails,
                    'performed_by' => $ownerName,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => "Manual override successfully applied to {$employee->name}.",
                    'data' => [
                        'employee' => $employee,
                    ],
                ], 200);
            });
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error applying manual override: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Returns timeline audit logs of administrative actions.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getAuditLogs(Request $request): JsonResponse
    {
        if (!$this->isOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden: Owner role required.',
            ], 403);
        }

        $logs = AuditLog::latest()->take(30)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'audit_logs' => $logs,
            ],
        ], 200);
    }

    /**
     * Get system financial policies (monthly bonus, late deduction, absence deduction).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getBonusSettings(Request $request): JsonResponse
    {
        if (!$this->isOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden: Owner role required.',
            ], 403);
        }

        $monthlyBonus = (float) (DB::table('system_settings')->where('setting_key', 'monthly_bonus_amount')->value('setting_value') ?: 2500.0);
        $lateDeduction = (float) (DB::table('system_settings')->where('setting_key', 'late_deduction_amount')->value('setting_value') ?: 250.0);
        $absenceDeduction = (float) (DB::table('system_settings')->where('setting_key', 'absence_deduction_amount')->value('setting_value') ?: 500.0);

        return response()->json([
            'success' => true,
            'data' => [
                'monthly_bonus_amount' => $monthlyBonus,
                'late_deduction_amount' => $lateDeduction,
                'absence_deduction_amount' => $absenceDeduction,
            ],
        ], 200);
    }

    /**
     * Update system financial policies (monthly bonus, late deduction, absence deduction).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function updateBonusSettings(Request $request): JsonResponse
    {
        if (!$this->isOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden: Owner role required.',
            ], 403);
        }

        $monthlyBonus = $request->input('monthly_bonus_amount', $request->input('amount'));
        $lateDeduction = $request->input('late_deduction_amount');
        $absenceDeduction = $request->input('absence_deduction_amount');

        if ($monthlyBonus !== null) {
            DB::table('system_settings')->updateOrInsert(
                ['setting_key' => 'monthly_bonus_amount'],
                ['setting_value' => (string) max(0, (float) $monthlyBonus), 'updated_at' => now()]
            );
        }
        if ($lateDeduction !== null) {
            DB::table('system_settings')->updateOrInsert(
                ['setting_key' => 'late_deduction_amount'],
                ['setting_value' => (string) max(0, (float) $lateDeduction), 'updated_at' => now()]
            );
        }
        if ($absenceDeduction !== null) {
            DB::table('system_settings')->updateOrInsert(
                ['setting_key' => 'absence_deduction_amount'],
                ['setting_value' => (string) max(0, (float) $absenceDeduction), 'updated_at' => now()]
            );
        }

        $currentBonus = (float) (DB::table('system_settings')->where('setting_key', 'monthly_bonus_amount')->value('setting_value') ?: 2500.0);
        $currentLate = (float) (DB::table('system_settings')->where('setting_key', 'late_deduction_amount')->value('setting_value') ?: 250.0);
        $currentAbsence = (float) (DB::table('system_settings')->where('setting_key', 'absence_deduction_amount')->value('setting_value') ?: 500.0);

        $ownerName = auth()->user() ? auth()->user()->name : 'Owner';
        AuditLog::create([
            'action' => 'UPDATE_BONUS_SETTING',
            'details' => "تحديث السياسات المالية للمؤسسة: بونص={$currentBonus} ج.م، خصم التأخير={$currentLate} ج.م، خصم الغياب={$currentAbsence} ج.م",
            'performed_by' => $ownerName,
        ]);

        return response()->json([
            'success' => true,
            'message' => "تم حفظ وتحديث السياسات المالية بنجاح (بونص: {$currentBonus} ج.م، تأخير: {$currentLate} ج.م، غياب: {$currentAbsence} ج.م)",
            'data' => [
                'monthly_bonus_amount' => $currentBonus,
                'late_deduction_amount' => $currentLate,
                'absence_deduction_amount' => $currentAbsence,
            ],
        ], 200);
    }

    /**
     * Grant a manual discretionary financial bonus to employee(s).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function grantBonus(Request $request): JsonResponse
    {
        if (!$this->isOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden: Owner role required.',
            ], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required',
            'amount' => 'required|numeric|min:1',
            'reason' => 'required|string|min:3|max:1000',
        ]);

        $amount = (float) $validated['amount'];
        $reason = trim($validated['reason']);
        $targetUserId = $validated['user_id'];
        $ownerName = auth()->user() ? auth()->user()->name : 'Owner';

        return DB::transaction(function () use ($targetUserId, $amount, $reason, $ownerName) {
            if ($targetUserId === 'all') {
                $employees = User::where('role', 'employee')->get();
                foreach ($employees as $emp) {
                    $emp->financial_balance = ($emp->financial_balance ?? 0.0) + $amount;
                    $emp->save();

                    PointsLedger::create([
                        'user_id' => $emp->id,
                        'point_type' => 'green',
                        'points_count' => 1,
                        'amount_deducted_or_rewarded' => $amount,
                        'status' => 'resolved',
                        'description' => "مكافأة خاصة من الإدارة: {$reason}",
                    ]);
                }
                $count = $employees->count();
                $msg = "تم صرف مكافأة قدرها {$amount} ج.م لجميع الموظفين ({$count} موظف) بنجاح";
            } else {
                $employee = User::where('id', $targetUserId)->lockForUpdate()->firstOrFail();
                $employee->financial_balance = ($employee->financial_balance ?? 0.0) + $amount;
                $employee->save();

                PointsLedger::create([
                    'user_id' => $employee->id,
                    'point_type' => 'green',
                    'points_count' => 1,
                    'amount_deducted_or_rewarded' => $amount,
                    'status' => 'resolved',
                    'description' => "مكافأة خاصة من الإدارة: {$reason}",
                ]);

                $msg = "تم صرف مكافأة قدرها {$amount} ج.م للموظف ({$employee->name}) بنجاح";
            }

            AuditLog::create([
                'action' => 'GRANT_BONUS',
                'details' => "{$msg} - السبب: {$reason}",
                'performed_by' => $ownerName,
            ]);

            return response()->json([
                'success' => true,
                'message' => $msg,
            ], 200);
        });
    }

    /**
     * Apply a manual discretionary deduction / penalty to employee(s).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function applyDeduction(Request $request): JsonResponse
    {
        if (!$this->isOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden: Owner role required.',
            ], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required',
            'amount' => 'required|numeric|min:1',
            'reason' => 'required|string|min:3|max:1000',
        ]);

        $amount = (float) $validated['amount'];
        $reason = trim($validated['reason']);
        $targetUserId = $validated['user_id'];
        $ownerName = auth()->user() ? auth()->user()->name : 'Owner';

        return DB::transaction(function () use ($targetUserId, $amount, $reason, $ownerName) {
            if ($targetUserId === 'all') {
                $employees = User::where('role', 'employee')->get();
                foreach ($employees as $emp) {
                    $emp->financial_balance = max(0.0, ($emp->financial_balance ?? 0.0) - $amount);
                    $emp->save();

                    PointsLedger::create([
                        'user_id' => $emp->id,
                        'point_type' => 'red',
                        'points_count' => 1,
                        'amount_deducted_or_rewarded' => -$amount,
                        'status' => 'resolved',
                        'description' => "خصم إداري مباشر: {$reason}",
                    ]);
                }
                $count = $employees->count();
                $msg = "تم تطبيق خصم إداري قدره {$amount} ج.م على جميع الموظفين ({$count} موظف) بنجاح";
            } else {
                $employee = User::where('id', $targetUserId)->lockForUpdate()->firstOrFail();
                $employee->financial_balance = max(0.0, ($employee->financial_balance ?? 0.0) - $amount);
                $employee->save();

                PointsLedger::create([
                    'user_id' => $employee->id,
                    'point_type' => 'red',
                    'points_count' => 1,
                    'amount_deducted_or_rewarded' => -$amount,
                    'status' => 'resolved',
                    'description' => "خصم إداري مباشر: {$reason}",
                ]);

                $msg = "تم تطبيق خصم إداري قدره {$amount} ج.م على الموظف ({$employee->name}) بنجاح";
            }

            AuditLog::create([
                'action' => 'APPLY_DEDUCTION',
                'details' => "{$msg} - السبب: {$reason}",
                'performed_by' => $ownerName,
            ]);

            return response()->json([
                'success' => true,
                'message' => $msg,
            ], 200);
        });
    }
}
