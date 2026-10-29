<?php

namespace App\Modules\Attendance\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Modules\Auth\Models\User;

class AttendanceLog extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'attendance_logs';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'check_in_time',
        'latitude',
        'longitude',
        'point_type',
        'is_excused',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'check_in_time' => 'datetime',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'is_excused' => 'boolean',
    ];

    /**
     * Relationship: AttendanceLog belongs to User.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
