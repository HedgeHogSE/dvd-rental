<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rentals', function (Blueprint $table) {
            $table->date('due_on')->nullable();
        });

        DB::table('rentals')->whereNotNull('booking_id')->update([
            'due_on' => DB::table('bookings')->select('end_date')
                ->whereColumn('bookings.id', 'rentals.booking_id'),
        ]);
    }

    public function down(): void
    {
        Schema::table('rentals', function (Blueprint $table) {
            $table->dropColumn('due_on');
        });
    }
};
