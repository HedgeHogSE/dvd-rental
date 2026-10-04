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
        Schema::create('dvds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('movie_id')->constrained()->onDelete('cascade'); // Связь с фильмом
            $table->string('inventory_number')->unique(); // Уникальный инвентарный номер
            $table->string('status')->default('available'); // Статусы: available, rented, reserved, unavailable
            $table->decimal('price_per_day', 8, 2); // Цена аренды в день
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dvds');
    }
};
