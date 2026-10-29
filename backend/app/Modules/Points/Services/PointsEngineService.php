<?php

namespace App\Modules\Points\Services;

use App\Modules\Points\Models\PointsLedger;
use App\Modules\Auth\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use Exception;
use DateTime;

/**
 * Class PointsEngineService
 * 
 * Production-ready Points & Penalties Business Logic Engine.
 * Handles Traffic Light (Green/Red/Black) evaluation, 250 EGP penalties,
 * Red point early green redemption, Black point 5-day streak swap,
 * and 2500 EGP InstaPay monthly commitment bonus.
 * 
 * @package App\Modules\Points\Services
 */
class PointsEngineService
{
    /**
     * Financial & Time Rule Constants (Config fallbacks)
     */
    private float $redPenaltyEgp;
    private float $monthlyBonusEgp;
    private int $blackRedemptionConsecutiveDays;

    public function __construct()
    {
        $this->redPenaltyEgp = (float) config('geofence.red_penalty_egp', env('RED_POINT_PENALTY_EGP', 250.0));
        $this->monthlyBonusEgp = (float) config('geofence.monthly_bonus_egp', env('MONTHLY_BONUS_EGP', 2500.0));
        $this->blackRedemptionConsecutiveDays = (int) config('geofence.black_redemption_days', env('BLACK_POINT_REDEMPTION_DAYS', 5));
    }

    /**
     * Evaluates attendance timestamp and determines point classification and financial penalty.
     *
     * @param string|DateTime $checkInTime Check-in timestamp or HH:mm string
     * @return array Evaluation details (status, point_type, penalty_amount, is_early, qualifies_black_redemption)
     */
    public function evaluateCheckInTime($checkInTime): array
    {
        $timeStr = $checkInTime instanceof DateTime ? $checkInTime->format('H:i') : (string) $checkInTime;
        [$hours, $minutes] = explode(':', $timeStr);
        $totalMinutes = ((int)$hours * 60) + (int)$minutes;

        // Time Window Markers in minutes
        $earlyStartMins = 7 * 60;   // 07:00 AM (420)
        $earlyBlackEndMins = 8 * 60; // 08:00 AM (480)
        $normalStartMins = 9 * 60;  // 09:00 AM (540)
        $lateStartMins = 10 * 60;   // 10:00 AM (600)
        $cutoffMins = 12 * 60;      // 12:00 PM (720)

        // 1. Past Cutoff (>= 12:00 PM) -> Gateway strictly closed
        if ($totalMinutes >= $cutoffMins) {
            return [
                'status' => 'BLACK',
                'point_type' => 'black',
                'is_early' => false,
                'qualifies_for_black_redemption' => false,
                'financial_impact' => 0.0,
                'message' => 'Check-in rejected. Gateway closed strictly at 12:00 PM.',
            ];
        }

        // 2. Early Arrival (07:00 AM - 09:00 AM) -> Earns Green + Early Compensation Credit
        if ($totalMinutes >= $earlyStartMins && $totalMinutes < $normalStartMins) {
            $qualifiesBlackRedemption = $totalMinutes < $earlyBlackEndMins; // 07:00 - 08:00 AM
            return [
                'status' => 'GREEN',
                'point_type' => 'green',
                'is_early' => true,
                'qualifies_for_black_redemption' => $qualifiesBlackRedemption,
                'financial_impact' => 0.0,
                'message' => $qualifiesBlackRedemption
                    ? 'Super Early Arrival! Earned +1 Green Point, +1 Early Credit & +1 Day towards Black Point Swap.'
                    : 'Early Arrival recorded! Earned +1 Green Point & +1 Early Compensation Credit.',
            ];
        }

        // 3. Normal On-Time Window (09:00 AM - 10:00 AM)
        if ($totalMinutes >= $normalStartMins && $totalMinutes < $lateStartMins) {
            return [
                'status' => 'GREEN',
                'point_type' => 'green',
                'is_early' => false,
                'qualifies_for_black_redemption' => false,
                'financial_impact' => 0.0,
                'message' => 'On-time Attendance recorded (Green Point).',
            ];
        }

        // 4. Late Window (10:00 AM - 12:00 PM) -> Red Point & 250 EGP Deduction
        return [
            'status' => 'RED',
            'point_type' => 'red',
            'is_early' => false,
            'qualifies_for_black_redemption' => false,
            'financial_impact' => -$this->redPenaltyEgp,
            'message' => "Late Arrival recorded (Red Point). Financial penalty of {$this->redPenaltyEgp} EGP applied.",
        ];
    }

    /**
     * Records a new point transaction in the ledger and updates user totals transactionally.
     *
     * @param int $userId
     * @param string $pointType 'green', 'red', or 'black'
     * @param float $financialImpact Financial penalty (-) or reward (+)
     * @param string $description Description text
     * @return PointsLedger
     */
    public function recordPointTransaction(int $userId, string $pointType, float $financialImpact, string $description): PointsLedger
    {
        return DB::transaction(function () use ($userId, $pointType, $financialImpact, $description) {
            $ledgerEntry = PointsLedger::create([
                'user_id' => $userId,
                'point_type' => $pointType,
                'points_count' => 1,
                'amount_deducted_or_rewarded' => $financialImpact,
                'status' => 'active',
                'description' => $description,
            ]);

            // Lock user row for transactional atomic update
            $user = User::where('id', $userId)->lockForUpdate()->first();
            if ($user) {
                if ($pointType === 'green') {
                    $user->green_points = ($user->green_points ?? 0) + 1;
                } elseif ($pointType === 'red') {
                    $user->red_points = ($user->red_points ?? 0) + 1;
                } elseif ($pointType === 'black') {
                    $user->black_points = ($user->black_points ?? 0) + 1;
                }

                if ($financialImpact != 0) {
                    $user->financial_balance = ($user->financial_balance ?? 0.0) + $financialImpact;
                }
                $user->save();
            }

            return $ledgerEntry;
        });
    }

    /**
     * Redeems 1 Early Green Credit to wipe out 1 Red Point and refund 250 EGP penalty ("تريكة التعويض 1").
     *
     * @param User $user
     * @return array Result of compensation operation
     */
    public function redeemRedPointWithEarlyCredit(User $user): array
    {
        return DB::transaction(function () use ($user) {
            // Lock user for update
            $freshUser = User::where('id', $user->id)->lockForUpdate()->firstOrFail();

            if (($freshUser->early_green_credits ?? 0) < 1) {
                return [
                    'success' => false,
                    'message' => 'Insufficient Early Green Credits. You must check in early (07:00 - 09:00 AM) to earn compensation credits.',
                ];
            }

            if (($freshUser->red_points ?? 0) < 1) {
                return [
                    'success' => false,
                    'message' => 'No active Red Points to redeem! Your record is currently clean of late penalties.',
                ];
            }

            // Find oldest active Red Point in ledger
            $activeRedLedger = PointsLedger::where('user_id', $freshUser->id)
                ->where('point_type', 'red')
                ->where('status', 'active')
                ->oldest()
                ->first();

            if ($activeRedLedger) {
                $activeRedLedger->status = 'compensated';
                $activeRedLedger->save();
            }

            // Update user balances: deduct early credit, decrement red points, increment green, refund 250 EGP
            $freshUser->early_green_credits -= 1;
            $freshUser->red_points -= 1;
            $freshUser->green_points += 1;
            $freshUser->financial_balance += $this->redPenaltyEgp;
            $freshUser->save();

            // Record compensation entry in ledger
            PointsLedger::create([
                'user_id' => $freshUser->id,
                'point_type' => 'green',
                'points_count' => 1,
                'amount_deducted_or_rewarded' => $this->redPenaltyEgp,
                'status' => 'compensated',
                'description' => "Redeemed 1 Early Green Credit to erase Red Point and refund {$this->redPenaltyEgp} EGP penalty.",
            ]);

            return [
                'success' => true,
                'user' => $freshUser,
                'message' => "Red Point erased successfully! Refunded {$this->redPenaltyEgp} EGP penalty to user balance.",
            ];
        });
    }

    /**
     * Processes Black Point automated redemption if employee achieves 5 consecutive early days (07:00 - 08:00 AM) ("تريكة التعويض 2").
     *
     * @param User $user
     * @return array Result of 5-day streak progression
     */
    public function processBlackPointRedemptionStreak(User $user): array
    {
        return DB::transaction(function () use ($user) {
            $freshUser = User::where('id', $user->id)->lockForUpdate()->firstOrFail();

            $newStreak = ($freshUser->consecutive_early_days ?? 0) + 1;
            $blackPointSwapped = false;
            $message = "Early attendance streak updated: {$newStreak}/{$this->blackRedemptionConsecutiveDays} days.";

            if ($newStreak >= $this->blackRedemptionConsecutiveDays) {
                if (($freshUser->black_points ?? 0) > 0) {
                    $blackPointSwapped = true;
                    $freshUser->black_points -= 1;
                    $freshUser->green_points += 1;
                    $freshUser->consecutive_early_days = 0; // Reset streak after swap

                    // Update ledger status
                    $activeBlackLedger = PointsLedger::where('user_id', $freshUser->id)
                        ->where('point_type', 'black')
                        ->where('status', 'active')
                        ->oldest()
                        ->first();

                    if ($activeBlackLedger) {
                        $activeBlackLedger->status = 'compensated';
                        $activeBlackLedger->save();
                    }

                    $message = "🎉 5 consecutive early days completed! System automatically converted 1 Black Point into a Green Point!";
                } else {
                    $freshUser->consecutive_early_days = $this->blackRedemptionConsecutiveDays;
                    $message = "5 consecutive early days achieved! No Black Points to swap currently.";
                }
            } else {
                $freshUser->consecutive_early_days = $newStreak;
            }

            $freshUser->save();

            return [
                'success' => true,
                'streak_days' => $freshUser->consecutive_early_days,
                'black_point_swapped' => $blackPointSwapped,
                'user' => $freshUser,
                'message' => $message,
            ];
        });
    }

    /**
     * Claims 2500 EGP Monthly Commitment Bonus to InstaPay if employee completed month with 0 Red & 0 Black points.
     *
     * @param User $user
     * @param string $instaPayNumber
     * @return array Result of bonus claim
     */
    public function claimMonthlyCommitmentBonus(User $user, string $instaPayNumber): array
    {
        if (empty(trim($instaPayNumber))) {
            throw new InvalidArgumentException('InstaPay VPA or account number is required.');
        }

        return DB::transaction(function () use ($user, $instaPayNumber) {
            $freshUser = User::where('id', $user->id)->lockForUpdate()->firstOrFail();

            if (($freshUser->red_points ?? 0) > 0 || ($freshUser->black_points ?? 0) > 0) {
                return [
                    'success' => false,
                    'message' => 'Ineligible for Monthly Bonus: You must complete the month with 0 Red Points and 0 Black Points.',
                ];
            }

            // Save InstaPay number & update financial balance
            $freshUser->insta_pay_number = trim($instaPayNumber);
            $freshUser->financial_balance = ($freshUser->financial_balance ?? 0.0) + $this->monthlyBonusEgp;
            $freshUser->save();

            // Record in ledger
            PointsLedger::create([
                'user_id' => $freshUser->id,
                'point_type' => 'green',
                'points_count' => 1,
                'amount_deducted_or_rewarded' => $this->monthlyBonusEgp,
                'status' => 'resolved',
                'description' => "Monthly Commitment Bonus disbursed to InstaPay ({$instaPayNumber})",
            ]);

            return [
                'success' => true,
                'user' => $freshUser,
                'bonus_amount' => $this->monthlyBonusEgp,
                'message' => "🎉 Monthly Commitment Bonus of {$this->monthlyBonusEgp} EGP successfully disbursed to InstaPay ({$instaPayNumber})!",
            ];
        });
    }
}
