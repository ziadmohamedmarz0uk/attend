<?php

namespace App\Modules\Auth\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Modules\Attendance\Models\AttendanceLog;
use App\Modules\Leaves\Models\LeaveRequest;
use App\Modules\Points\Models\PointsLedger;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'users';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'branch_id',
        'department',
        'insta_pay_number',
        'green_points',
        'red_points',
        'black_points',
        'early_green_credits',
        'consecutive_early_days',
        'financial_balance',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'green_points' => 'integer',
        'red_points' => 'integer',
        'black_points' => 'integer',
        'early_green_credits' => 'integer',
        'consecutive_early_days' => 'integer',
        'financial_balance' => 'decimal:2',
    ];

    /**
     * Relationship: User has many Attendance Logs.
     */
    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class, 'user_id');
    }

    /**
     * Relationship: User has many Leave Requests.
     */
    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class, 'user_id');
    }

    /**
     * Relationship: User has many Points Ledger entries.
     */
    public function pointsLedger(): HasMany
    {
        return $this->hasMany(PointsLedger::class, 'user_id');
    }

    /**
     * Relationship: User belongs to a Branch (Geofenced location).
     */
    public function branch()
    {
        return $this->belongsTo(\App\Modules\OwnerControl\Models\Branch::class, 'branch_id');
    }
}
