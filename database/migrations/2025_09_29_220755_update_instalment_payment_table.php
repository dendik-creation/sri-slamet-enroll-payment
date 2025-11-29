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
        Schema::table('instalment_payments', function (Blueprint $table) {
            $table->foreignId('salary_id')->nullable()->change();
            $table->enum('payment_source', ['salary', 'direct'])->default('salary')->after('salary_id');
            $table->integer('step')->after('payment_source');
            if (!Schema::hasColumn('instalment_payments', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('instalments', function (Blueprint $table) {
            if (!Schema::hasColumn('instalments', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instalment_payments', function (Blueprint $table) {
            $table->foreignId('salary_id')->nullable(false)->change();
            $table->dropColumn(['payment_source', 'step']);
            if (Schema::hasColumn('instalment_payments', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });

        Schema::table('instalments', function (Blueprint $table) {
            if (Schema::hasColumn('instalments', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};
