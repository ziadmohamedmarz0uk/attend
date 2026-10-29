<?php

namespace App\Modules\Points\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Modules\Auth\Models\User;

class PointsLedger extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'points_ledger';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'point_type',
        'points_count',
        'amount_deducted_or_rewarded',
        'status',
        'description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'points_count' => 'integer',
        'amount_deducted_or_rewarded' => 'decimal:2',
    ];

    /**
     * Relationship: PointsLedger belongs to User.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
