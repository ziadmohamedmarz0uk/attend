<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Modules\Auth\Models\User;
use App\Modules\Attendance\Models\AttendanceLog;
use App\Modules\Leaves\Services\LeaveImmunityService;
use App\Modules\Points\Services\PointsEngineService;
use App\Modules\OwnerControl\Models\AuditLog;
use DateTime;
use Exception;

/**
 * Class ProcessCutoffAbsencesCommand
 * 
 * Scheduled Artisan Command executing daily at 12:00 PM server time.
 * Evaluates all employees, checks leave immunity shield, and automatically
 * assigns Black points for missing check-ins.
 */
class ProcessCutoffAbsencesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:process-cutoff {--date= : Target date YYYY-MM-DD (Default: today)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Executes daily 12:00 PM server cutoff: assigns Black points to unexcused missing employees and honors leave immunity.';

    private LeaveImmunityService $leaveImmunityService;
    private PointsEngineService $pointsEngineService;

    public function __construct(
        LeaveImmunityService $leaveImmunityService,
        PointsEngineService $pointsEngineService
    ) {
        parent::__construct();
        $this->leaveImmunityService = $leaveImmunityService;
        $this->pointsEngineService = $pointsEngineService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $targetDateStr = $this->option('date') ?: (new DateTime())->format('Y-m-d');
        $this->info("=================================================");
        $this->info("⏰ Processing 12:00 PM Cutoff Absences for: {$targetDateStr}");
        $this->info("=================================================");

        try {
            $employees = User::where('role', 'employee')->get();
            $processedCount = 0;
            $blackPointsAssigned = 0;
            $excusedLeavesCount = 0;

            foreach ($employees as $user) {
                DB::transaction(function () use ($user, $targetDateStr, &$processedCount, &$blackPointsAssigned, &$excusedLeavesCount) {
                    // 1. Check if employee already checked in on target date
                    $alreadyCheckedIn = AttendanceLog::where('user_id', $user->id)
                        ->whereDate('check_in_time', $targetDateStr)
                        ->exists();

                    if ($alreadyCheckedIn) {
                        return; // Skip already checked-in employee
                    }

                    $processedCount++;

                    // 2. Check Leave Immunity Shield
                    $immunityCheck = $this->leaveImmunityService->isEmployeeImmuneOnDate($user->id, $targetDateStr);

                    if ($immunityCheck['is_immune']) {
                        $excusedLeavesCount++;

                        // Record excused log with leave immunity flag
                        AttendanceLog::create([
                            'user_id' => $user->id,
                            'check_in_time' => "{$targetDateStr} 12:00:00",
                            'latitude' => 0.0,
                            'longitude' => 0.0,
                            'point_type' => 'none',
                            'is_excused' => true,
                        ]);

                        $this->info("🛡️ [Excused] {$user->name}: Shielded by Approved Leave (\"{$immunityCheck['reason']}\").");
                    } else {
                        $blackPointsAssigned++;

                        // Assign Black Point & record transaction in ledger
                        $this->pointsEngineService->recordPointTransaction(
                            $user->id,
                            'black',
                            0.0,
                            "Absence recorded after 12:00 PM cutoff on {$targetDateStr} without approved leave."
                        );

                        // Reset 5-day early streak on unexcused absence
                        $freshUser = User::find($user->id);
                        if ($freshUser) {
                            $freshUser->consecutive_early_days = 0;
                            $freshUser->save();
                        }

                        // Create AttendanceLog record marked as Black point
                        AttendanceLog::create([
                            'user_id' => $user->id,
                            'check_in_time' => "{$targetDateStr} 12:00:00",
                            'latitude' => 0.0,
                            'longitude' => 0.0,
                            'point_type' => 'black',
                            'is_excused' => false,
                        ]);

                        $this->warn("⚫ [Black Point] {$user->name}: Absence assigned after 12:00 PM cutoff.");
                    }
                });
            }

            // Log execution summary in AuditLog
            AuditLog::create([
                'action' => 'CUTOFF_PROCESSED',
                'details' => "Automated 12:00 PM Cutoff processed for {$targetDateStr}: {$blackPointsAssigned} Black points assigned, {$excusedLeavesCount} excused by approved leave.",
                'performed_by' => 'System Scheduler (Cron Job)',
            ]);

            $this->info("=================================================");
            $this->info("✅ Cutoff Processing Complete: {$processedCount} Checked, {$blackPointsAssigned} Black Points Assigned, {$excusedLeavesCount} Excused Leaves.");
            $this->info("=================================================");

            return Command::SUCCESS;
        } catch (Exception $e) {
            $this->error("❌ Cutoff Processing Error: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
