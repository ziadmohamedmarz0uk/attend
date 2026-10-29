<?php

namespace App\Modules\Points\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Modules\Points\Services\PointsEngineService;
use App\Modules\Points\Models\PointsLedger;
use App\Modules\Auth\Models\User;
use InvalidArgumentException;
use Exception;

/**
 * Class PointsController
 * 
 * Production Controller handling employee Traffic Light points redemption,
 * Red point early credit compensation, Black point 5-day streak swap,
 * and Monthly InstaPay commitment bonus disbursement.
 * 
 * @package App\Modules\Points\Controllers
 */
class PointsController extends Controller
{
    private PointsEngineService $pointsEngineService;

    public function __construct(PointsEngineService $pointsEngineService)
    {
        $this->pointsEngineService = $pointsEngineService;
    }

    /**
     * Redeems 1 Early Green Credit to wipe out 1 Red Point and refund 250 EGP penalty ("تريكة التعويض 1").
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function redeemRedPoint(Request $request): JsonResponse
    {
        $authUser = auth()->user();
        if ($authUser && $authUser->role !== 'owner') {
            return response()->json([
                'success' => false,
                'message' => 'عذراً! إلغاء أو تسوية النقاط والخصومات متاح حصرياً للمدير (Owner) عبر التعديل الإداري أو مراجعة التظلمات.',
            ], 403);
        }

        $userId = $request->input('user_id') ?? auth()->id();
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized or missing user identity.',
            ], 401);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Employee record not found.',
            ], 404);
        }

        try {
            $result = $this->pointsEngineService->redeemRedPointWithEarlyCredit($user);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['message'],
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => [
                    'user' => [
                        'id' => $result['user']->id,
                        'green_points' => $result['user']->green_points,
                        'red_points' => $result['user']->red_points,
                        'black_points' => $result['user']->black_points,
                        'early_green_credits' => $result['user']->early_green_credits,
                        'financial_balance' => $result['user']->financial_balance,
                    ],
                ],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error processing Red Point redemption: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Processes Black Point automated redemption if employee achieves 5 consecutive early days (07:00 - 08:00 AM) ("تريكة التعويض 2").
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function processBlackPointStreak(Request $request): JsonResponse
    {
        $userId = $request->input('user_id') ?? auth()->id();
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized or missing user identity.',
            ], 401);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Employee record not found.',
            ], 404);
        }

        try {
            $result = $this->pointsEngineService->processBlackPointRedemptionStreak($user);

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => [
                    'consecutive_early_days' => $result['streak_days'],
                    'black_point_swapped' => $result['black_point_swapped'],
                    'user' => [
                        'id' => $result['user']->id,
                        'green_points' => $result['user']->green_points,
                        'black_points' => $result['user']->black_points,
                        'consecutive_early_days' => $result['user']->consecutive_early_days,
                    ],
                ],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error processing Black Point streak: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Claims 2500 EGP Monthly Commitment Bonus to InstaPay if employee completed month with 0 Red & 0 Black points.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function claimMonthlyBonus(Request $request): JsonResponse
    {
        $authUser = auth()->user();
        if ($authUser && $authUser->role !== 'owner') {
            return response()->json([
                'success' => false,
                'message' => 'صرف المستحقات والمكافآت متاح حصرياً لمدير النظام (Owner). لا يمكن للموظف إيداع مكافآت لنفسه دون اعتماد إداري.',
            ], 403);
        }

        $validated = $request->validate([
            'insta_pay_number' => 'required|string|max:255',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $userId = $validated['user_id'] ?? auth()->id();
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized or missing user identity.',
            ], 401);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Employee record not found.',
            ], 404);
        }

        try {
            $result = $this->pointsEngineService->claimMonthlyCommitmentBonus($user, $validated['insta_pay_number']);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $result['message'],
                ], 400);
            }

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => [
                    'bonus_amount' => $result['bonus_amount'],
                    'insta_pay_number' => $result['user']->insta_pay_number,
                    'financial_balance' => $result['user']->financial_balance,
                ],
            ], 200);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error claiming monthly bonus: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Returns user's points ledger transaction history and balance summary.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getLedgerSummary(Request $request): JsonResponse
    {
        $userId = $request->input('user_id') ?? auth()->id();
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized or missing user identity.',
            ], 401);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Employee record not found.',
            ], 404);
        }

        $ledgerHistory = PointsLedger::where('user_id', $user->id)
            ->latest()
            ->take(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'user_summary' => [
                    'green_points' => $user->green_points ?? 0,
                    'red_points' => $user->red_points ?? 0,
                    'black_points' => $user->black_points ?? 0,
                    'early_credits' => $user->early_green_credits ?? 0,
                    'consecutive_early_days' => $user->consecutive_early_days ?? 0,
                    'financial_balance' => $user->financial_balance ?? 0.0,
                    'insta_pay_number' => $user->insta_pay_number,
                ],
                'history' => $ledgerHistory,
            ],
        ], 200);
    }
}
