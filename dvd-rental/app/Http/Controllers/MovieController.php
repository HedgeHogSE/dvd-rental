<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use App\Models\Movie;
use Illuminate\Support\Arr;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MovieController extends Controller
{
    public function index(Request $request)
    {
        $query = Movie::with(['genres', 'dvds'])
            ->withAvg(['reviews' => function ($q) {
                $q->where('status', 'published');
            }], 'rating')
            ->withCount(['reviews' => function ($q) {
                $q->where('status', 'published');
            }]);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        if ($request->filled('genre_id')) {
            $query->whereHas('genres', fn ($genres) => $genres->whereKey($request->integer('genre_id')));
        }

        if ($request->filled('year_from')) {
            $query->where('release_year', '>=', $request->integer('year_from'));
        }
        if ($request->filled('year_to')) {
            $query->where('release_year', '<=', $request->integer('year_to'));
        }

        if ($request->filled('rating_min')) {
            $ratingMin = $request->float('rating_min');
            $query->whereRaw(
                "(SELECT AVG(rating) FROM reviews WHERE reviews.movie_id = movies.id AND reviews.status = 'published') >= ?",
                [$ratingMin]
            );
        }

        if ($request->boolean('available')) {
            $query->whereHas('dvds', function ($q) {
                $q->availableForIssue();
            });
        }

        $sortField = $request->input('sort', 'created_at');
        $sortOrder = $request->input('order', 'desc') === 'asc' ? 'asc' : 'desc';

        $allowedSorts = ['title', 'release_year', 'reviews_avg_rating', 'created_at'];
        if (in_array($sortField, $allowedSorts, true)) {
            if ($sortField === 'reviews_avg_rating') {
                $query->orderByRaw(
                    "(SELECT AVG(rating) FROM reviews WHERE reviews.movie_id = movies.id AND reviews.status = 'published') " . $sortOrder . " NULLS LAST"
                );
            } else {
                $query->orderBy($sortField, $sortOrder);
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = max(1, min($request->integer('per_page', 15), 100));

        return response()->json($query->paginate($perPage), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'release_year' => 'required|integer|min:1888|max:' . (date('Y') + 1),
            'duration' => 'required|integer|min:1',
            'genre_ids' => 'required|array|list|min:1',
            'genre_ids.*' => 'required|integer|distinct|exists:genres,id',
        ]);

        $movie = DB::transaction(function () use ($validated) {
            $genreIds = $validated['genre_ids'];
            $this->lockGenres($genreIds);

            $movie = Movie::create(Arr::except($validated, 'genre_ids'));
            $movie->genres()->attach($genreIds);

            return $movie;
        });

        return response()->json([
            'message' => 'Фильм успешно создан',
            'movie' => $movie->load('genres'),
        ], 201);
    }

    public function show(Movie $movie)
    {
        $movie->load(['genres', 'dvds'])
            ->loadAvg(['reviews' => function ($q) {
                $q->where('status', 'published');
            }], 'rating')
            ->loadCount(['reviews' => function ($q) {
                $q->where('status', 'published');
            }]);

        return response()->json($movie, 200);
    }
    public function update(Request $request, Movie $movie)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'release_year' => 'sometimes|required|integer|min:1888|max:' . (date('Y') + 1),
            'duration' => 'sometimes|required|integer|min:1',
            'genre_ids' => 'sometimes|required|array|list|min:1',
            'genre_ids.*' => 'required|integer|distinct|exists:genres,id',
        ]);

        DB::transaction(function () use ($movie, $validated) {
            $genreIds = $validated['genre_ids'] ?? null;
            if ($genreIds !== null) {
                $this->lockGenres($genreIds);
            }

            $movie->update(Arr::except($validated, 'genre_ids'));
            if ($genreIds !== null) {
                $movie->genres()->sync($genreIds);
            }
        });

        return response()->json([
            'message' => 'Фильм успешно обновлен',
            'movie' => $movie->load('genres'),
        ], 200);
    }

    private function lockGenres(array $genreIds): void
    {
        // Match the lock order used when deleting a genre.
        $genres = Genre::query()->orderBy('id')->lockForUpdate()->pluck('id');
        if (collect($genreIds)->diff($genres)->isNotEmpty()) {
            throw ValidationException::withMessages([
                'genre_ids' => ['Один из выбранных жанров больше не существует.'],
            ]);
        }
    }

    public function destroy(Movie $movie)
    {
        $movie->delete();

        return response()->json([
            'message' => 'Фильм успешно удален',
        ], 200);
    }
}
