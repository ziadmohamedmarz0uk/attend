<?php

namespace App\Modules\Auth\Services;

use App\Modules\Auth\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;
use Exception;

/**
 * Class AuthService
 * 
 * Handles user authentication logic, password verification,
 * Sanctum token generation, and secure session revocation.
 * 
 * @package App\Modules\Auth\Services
 */
class AuthService
{
    /**
     * Authenticates user credentials and issues a Sanctum API token.
     *
     * @param string $email
     * @param string $password
     * @return array Contains authenticated user model and plain-text API token
     * @throws ValidationException If credentials fail verification
     */
    public function login(string $email, string $password): array
    {
        $user = User::where('email', strtolower(trim($email)))->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials provided. Please check your email and password.'],
            ]);
        }

        // Revoke previous tokens if needed and issue new Sanctum token
        $token = $user->createToken('smart_attendance_auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ];
    }

    /**
     * Revokes current user access token (Logout).
     *
     * @param User $user
     * @return bool
     */
    public function logout(User $user): bool
    {
        try {
            if ($user->currentAccessToken()) {
                $user->currentAccessToken()->delete();
            } else {
                $user->tokens()->delete();
            }
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}
