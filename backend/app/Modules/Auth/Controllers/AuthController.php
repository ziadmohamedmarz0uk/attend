<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\Auth\Services\AuthService;
use Illuminate\Validation\ValidationException;
use Exception;

/**
 * Class AuthController
 * 
 * Controller handling user authentication endpoints (login, logout, authenticated user profile).
 * 
 * @package App\Modules\Auth\Controllers
 */
class AuthController extends Controller
{
    private AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Authenticates employee or owner and returns Sanctum token.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:6',
        ]);

        try {
            $authData = $this->authService->login($validated['email'], $validated['password']);

            return response()->json([
                'success' => true,
                'message' => "Welcome back, {$authData['user']->name}!",
                'data' => [
                    'token' => $authData['token'],
                    'token_type' => $authData['token_type'],
                    'user' => [
                        'id' => $authData['user']->id,
                        'name' => $authData['user']->name,
                        'email' => $authData['user']->email,
                        'role' => $authData['user']->role,
                        'department' => $authData['user']->department,
                        'green_points' => $authData['user']->green_points ?? 0,
                        'red_points' => $authData['user']->red_points ?? 0,
                        'black_points' => $authData['user']->black_points ?? 0,
                        'early_green_credits' => $authData['user']->early_green_credits ?? 0,
                        'financial_balance' => $authData['user']->financial_balance ?? 0.0,
                    ],
                ],
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error during login: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Revokes current user token (Logout).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user() ?? auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized user.',
            ], 401);
        }

        $loggedOut = $this->authService->logout($user);

        return response()->json([
            'success' => $loggedOut,
            'message' => $loggedOut ? 'Logged out successfully.' : 'Failed to revoke token.',
        ], 200);
    }

    /**
     * Returns authenticated user profile and live points ledger summary.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user() ?? auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized user profile request.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
            ],
        ], 200);
    }
}
