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
        Schema::create('rentals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Кто взял
            $table->foreignId('dvd_id')->constrained()->onDelete('cascade'); // Какой диск

            // Внешний ключ на бронирование (может быть NULL, если выдано без брони)
            $table->foreignId('booking_id')->nullable()->constrained()->onDelete('set null');

            $table->timestamp('issued_at'); // Дата и время выдачи
            $table->timestamp('returned_at')->nullable(); // Дата и время фактического возврата
            $table->string('status')->default('active'); // Статусы: active, returned, overdue
            $table->decimal('price', 8, 2); // Итоговая стоимость аренды
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rentals');
    }
};
