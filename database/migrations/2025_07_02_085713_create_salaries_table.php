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
        Schema::create('salaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees');
            $table->date('salary_date')->default(now()->format('Y-m-d'));
            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();
            $table->integer('month');
            $table->integer('year');
            $table->float('total_work_days');
            $table->float('total_overtime_hours');
            $table->integer('basic_salary');
            $table->integer('overtime_salary');
            $table->integer('total_deduction');
            $table->integer('net_salary');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salaries');
    }
};
