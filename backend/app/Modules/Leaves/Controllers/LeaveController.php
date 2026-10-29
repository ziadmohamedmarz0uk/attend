<?php

namespace App\Modules\Leaves\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Modules\Leaves\Services\LeaveImmunityService;
use App\Modules\Leaves\Models\LeaveRequest;
use App\Modules\Auth\Models\User;
use InvalidArgumentException;
use Exception;

/**
 * Class LeaveController
 * 
 * Production Controller handling employee leave submissions, date overlap verification,
 * and Owner real-time review (Approval / Rejection with Automated Immunity activation).
 * 
 * @package App\Modules\Leaves\Controllers
 */
class LeaveController extends Controller
{
    private LeaveImmunityService $leaveImmunityService;

    public function __construct(LeaveImmunityService $leaveImmunityService)
    {
        $this->leaveImmunityService = $leaveImmunityService;
    }

    /**
     * Submits a new leave request for an employee.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function submitLeave(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'required|date|date_format:Y-m-d',
            'end_date' => 'required|date|date_format:Y-m-d|after_or_equal:start_date',
            'reason' => 'required|string|min:3|max:1000',
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

        try {
            // 1. Service Integration: Verify date range overlaps
            $overlapCheck = $this->leaveImmunityService->checkLeaveDateOverlap(
                $user->id,
                $validated['start_date'],
                $validated['end_date']
            );

            if ($overlapCheck['has_overlap']) {
                return response()->json([
                    'success' => false,
                    'message' => $overlapCheck['message'],
                ], 400);
            }

            // 2. Transactionally save new leave request
            return DB::transaction(function () use ($user, $validated) {
                $leaveRequest = LeaveRequest::create([
                    'user_id' => $user->id,
                    'start_date' => $validated['start_date'],
                    'end_date' => $validated['end_date'],
                    'reason' => trim($validated['reason']),
                    'status' => 'pending',
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Leave request submitted successfully. Routed directly to Owner Dashboard for review.',
                    'data' => [
                        'leave_request' => $leaveRequest,
                    ],
                ], 201);
            });
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error submitting leave request: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Owner Action: Approves or Rejects a leave request and triggers automated immunity.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function reviewLeave(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'leave_id' => 'required|exists:leave_requests,id',
            'status' => 'required|in:approved,rejected',
        ]);

        $reviewer = auth()->user();
        // Fallback role check (if auth disabled in dev)
        if ($reviewer && $reviewer->role !== 'owner') {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden: Only the Owner can approve or reject leave requests.',
            ], 403);
        }

        try {
            return DB::transaction(function () use ($validated) {
                $leaveRequest = LeaveRequest::where('id', $validated['leave_id'])
                    ->lockForUpdate()
                    ->first();

                if (!$leaveRequest) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Leave request record not found.',
                    ], 404);
                }

                $leaveRequest->status = $validated['status'];
                $leaveRequest->save();

                $immunityMessage = $validated['status'] === 'approved'
                    ? 'Automated Leave Immunity activated! Employee is shielded from absence penalties during this approved period.'
                    : 'Leave request rejected.';

                return response()->json([
                    'success' => true,
                    'message' => "Leave request status updated to {$validated['status']}. {$immunityMessage}",
                    'data' => [
                        'leave_request' => $leaveRequest,
                    ],
                ], 200);
            });
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error reviewing leave request: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lists leave requests for employee or all requests for Owner.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function listLeaves(Request $request): JsonResponse
    {
        $user = auth()->user();
        $targetUserId = $request->input('user_id');

        $query = LeaveRequest::with('user:id,name,email,department')->latest();

        // If specific user requested or normal employee viewing their own
        if ($targetUserId) {
            $query->where('user_id', $targetUserId);
        } elseif ($user && $user->role === 'employee') {
            $query->where('user_id', $user->id);
        }

        $leaves = $query->get();

        return response()->json([
            'success' => true,
            'data' => [
                'leaves' => $leaves,
                'pending_count' => $leaves->where('status', 'pending')->count(),
            ],
        ], 200);
    }
}
