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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees');
            // Period-based attendance: one record can cover a week or a month
            $table->date('period_start');
            $table->date('period_end');
            // Total work days in the period (can be fractional, e.g., 5.5)
            $table->float('work_days')->default(0);
            // Total overtime hours accumulated in the period
            $table->float('overtime')->default(0);
            $table->boolean('is_used')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
