<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('LOCK TABLE movies IN ACCESS EXCLUSIVE MODE');
        }

        Schema::create('genre_movie', function (Blueprint $table) {
            $table->foreignId('movie_id')->constrained()->cascadeOnDelete();
            $table->foreignId('genre_id')->constrained()->cascadeOnDelete();
            $table->primary(['movie_id', 'genre_id']);
            $table->index('genre_id');
        });

        DB::table('genre_movie')->insertUsing(
            ['movie_id', 'genre_id'],
            DB::table('movies')->select('id', 'genre_id'),
        );

        Schema::table('movies', function (Blueprint $table) {
            $table->dropConstrainedForeignId('genre_id');
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('LOCK TABLE movies IN ACCESS EXCLUSIVE MODE');
            DB::statement('LOCK TABLE genre_movie IN ACCESS EXCLUSIVE MODE');
        }

        $ambiguous = DB::table('movies')
            ->leftJoin('genre_movie', 'movies.id', '=', 'genre_movie.movie_id')
            ->select('movies.id')
            ->groupBy('movies.id')
            ->havingRaw('count(genre_movie.genre_id) <> 1')
            ->exists();

        if ($ambiguous) {
            throw new RuntimeException('Rollback requires exactly one genre per movie.');
        }

        Schema::table('movies', function (Blueprint $table) {
            $table->foreignId('genre_id')->nullable()->constrained()->cascadeOnDelete();
        });

        DB::table('movies')->update([
            'genre_id' => DB::table('genre_movie')
                ->select('genre_id')
                ->whereColumn('movie_id', 'movies.id'),
        ]);

        Schema::table('movies', function (Blueprint $table) {
            $table->unsignedBigInteger('genre_id')->nullable(false)->change();
        });

        Schema::dropIfExists('genre_movie');
    }
};
