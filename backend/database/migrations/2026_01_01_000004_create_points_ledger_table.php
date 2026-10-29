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
        Schema::create('points_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('point_type', ['green', 'red', 'black']);
            $table->integer('points_count')->default(1);
            $table->decimal('amount_deducted_or_rewarded', 10, 2)->default(0.00)->comment('Financial penalty (e.g. 250 EGP deduction) or reward (e.g. 2500 EGP bonus)');
            $table->enum('status', ['active', 'resolved', 'compensated'])->default('active');
            $table->text('description')->nullable();
            $table->timestamps();

            // Index for fast query of user points ledger
            $table->index(['user_id', 'point_type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('points_ledger');
    }
};
