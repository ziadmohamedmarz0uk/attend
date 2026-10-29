<?php

namespace App\Modules\OwnerControl\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Modules\Auth\Models\User;

class Branch extends Model
{
    use HasFactory;

    protected $table = 'branches';

    protected $fillable = [
        'name',
        'latitude',
        'longitude',
        'radius_meters',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'radius_meters' => 'integer',
        'is_active' => 'boolean',
    ];

    public function employees(): HasMany
    {
        return $this->hasMany(User::class, 'branch_id');
    }
}
