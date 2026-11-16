<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('roles')->delete();

        DB::table('roles')->insert([
            ['name' => 'admin', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'client', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'employee', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('roles')->delete();

        DB::table('roles')->insert([
            ['name' => 'Admin', 'created_at' => '2026-10-04 09:45:19', 'updated_at' => '2026-10-04 09:45:19'],
            ['name' => 'Client', 'created_at' => '2026-10-04 09:45:43', 'updated_at' => '2026-10-04 09:45:43'],
            ['name' => 'Employee', 'created_at' => '2026-10-04 09:45:43', 'updated_at' => '2026-10-04 09:45:43'],
        ]);
    }
};
