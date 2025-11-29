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
        Schema::table('salary_deductions', function (Blueprint $table) {
            $table->enum('frequency', ['per_payrun', 'monthly_once'])->default('per_payrun')->after('target_employee');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('salary_deductions', function (Blueprint $table) {
            $table->dropColumn('frequency');
        });
    }
};
