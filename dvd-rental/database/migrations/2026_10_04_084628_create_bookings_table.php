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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Кто забронировал
            $table->foreignId('dvd_id')->constrained()->onDelete('cascade'); // Какой диск
            $table->date('start_date'); // Дата начала
            $table->date('end_date'); // Дата окончания
            $table->string('status')->default('active'); // Статусы: active, cancelled, completed
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
