<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id(); // bigint UNSIGNED primary key + auto increment
            $table->string('name')->unique(); // VARCHAR(255)
            $table->timestamps(); // создаст created_at и updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
