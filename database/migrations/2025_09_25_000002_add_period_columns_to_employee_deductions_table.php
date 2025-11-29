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
        Schema::table('employee_deductions', function (Blueprint $table) {
            $table->unsignedTinyInteger('month')->default(1)->after('amount');
            $table->unsignedSmallInteger('year')->default(date('Y'))->after('month');
            $table->unsignedBigInteger('employee_id')->default(1)->after('id');
            $table->unique(['employee_id', 'deduction_id', 'month', 'year'], 'uniq_employee_deduction_period');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employee_deductions', function (Blueprint $table) {
            $table->dropUnique('uniq_employee_deduction_period');
            $table->dropColumn(['employee_id', 'month', 'year']);
        });
    }
};
