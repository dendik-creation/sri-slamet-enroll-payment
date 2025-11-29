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
        Schema::create('instalment_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('instalment_id');
            $table->foreignId('salary_id')->constrained()->onDelete('cascade');
            $table->integer('payment_value');
            $table->date('paid_at');
            $table->timestamps();

            $table->foreign('instalment_id')->references('id')->on('instalments')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('instalment_payments');
    }
};
