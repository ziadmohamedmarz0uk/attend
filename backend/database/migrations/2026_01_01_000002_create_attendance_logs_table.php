<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attendance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->dateTime('check_in_time');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->enum('point_type', ['green', 'red', 'black', 'none'])->default('none');
            $table->boolean('is_excused')->default(false)->comment('Flags whether attendance/absence is excused by approved leave immunity');
            $table->timestamps();

            // Indexes for fast lookup by user and date ranges
            $table->index(['user_id', 'check_in_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_logs');
    }
};
