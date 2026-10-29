<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Auth\Controllers\AuthController;
use App\Modules\Attendance\Controllers\AttendanceController;
use App\Modules\Points\Controllers\PointsController;
use App\Modules\Leaves\Controllers\LeaveController;
use App\Modules\OwnerControl\Controllers\OwnerController;
use App\Modules\OwnerControl\Controllers\BranchController;

/*
|--------------------------------------------------------------------------
| API Routes - Smart Attendance & Rewards System
|--------------------------------------------------------------------------
|
| Here is where API routes are registered for the Smart Attendance application.
| Routes are protected using Laravel Sanctum authentication and HMVC controllers.
|
*/

// Public Health Check Endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'HEALTHY',
        'system' => 'Smart Attendance API Server',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Public Auth Endpoints
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
});

/*
|--------------------------------------------------------------------------
| Protected Employee & Management Routes (auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // 0. Auth Session & Profile Routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
    });

    // 1. Attendance & GPS Geofencing Module Routes
    Route::prefix('attendance')->group(function () {
        Route::post('/check-in', [AttendanceController::class, 'checkIn'])->name('attendance.checkIn');
    });

    // 2. Points & Rewards Ledger Module Routes
    Route::prefix('points')->group(function () {
        Route::post('/redeem-red', [PointsController::class, 'redeemRedPoint'])->name('points.redeemRed');
        Route::post('/process-streak', [PointsController::class, 'processBlackPointStreak'])->name('points.processStreak');
        Route::post('/claim-bonus', [PointsController::class, 'claimMonthlyBonus'])->name('points.claimBonus');
        Route::get('/ledger-summary', [PointsController::class, 'getLedgerSummary'])->name('points.ledgerSummary');
    });

    // 3. Leave Management Module Routes
    Route::prefix('leaves')->group(function () {
        Route::post('/submit', [LeaveController::class, 'submitLeave'])->name('leaves.submit');
        Route::post('/review', [LeaveController::class, 'reviewLeave'])->name('leaves.review');
        Route::get('/list', [LeaveController::class, 'listLeaves'])->name('leaves.list');
    });

    // 4. Owner Control Panel Module Routes
    Route::prefix('owner')->group(function () {
        Route::get('/dashboard-stats', [OwnerController::class, 'getDashboardStats'])->name('owner.dashboardStats');
        Route::post('/manual-override', [OwnerController::class, 'manualOverride'])->name('owner.manualOverride');
        Route::get('/audit-logs', [OwnerController::class, 'getAuditLogs'])->name('owner.auditLogs');
        Route::get('/bonus-settings', [OwnerController::class, 'getBonusSettings'])->name('owner.bonusSettings.get');
        Route::post('/bonus-settings', [OwnerController::class, 'updateBonusSettings'])->name('owner.bonusSettings.update');
        Route::post('/grant-bonus', [OwnerController::class, 'grantBonus'])->name('owner.grantBonus');
        Route::post('/apply-deduction', [OwnerController::class, 'applyDeduction'])->name('owner.applyDeduction');

        // Geofencing & Branches Management
        Route::get('/branches', [BranchController::class, 'index'])->name('owner.branches.index');
        Route::post('/branches', [BranchController::class, 'store'])->name('owner.branches.store');
        Route::get('/branches/{id}', [BranchController::class, 'show'])->name('owner.branches.show');
        Route::put('/branches/{id}', [BranchController::class, 'update'])->name('owner.branches.update');
        Route::delete('/branches/{id}', [BranchController::class, 'destroy'])->name('owner.branches.destroy');
    });

    // 5. Active Locations for Employees
    Route::get('/branches/active', [BranchController::class, 'activeBranches'])->name('branches.active');

});

/*
|--------------------------------------------------------------------------
| Fallback Routes (For Initial Testing / Unauthenticated API Clients)
|--------------------------------------------------------------------------
*/
Route::get('/branches/active', [BranchController::class, 'activeBranches']);

