<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MovieController extends Controller
{
    public function index(Request $request)
    {
        $query = Movie::with(['genre', 'dvds'])
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
            $query->where('genre_id', $request->input('genre_id'));
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
                $q->where('status', 'available');
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
            'genre_id' => 'required|exists:genres,id',
        ]);

        $movie = Movie::create($validated);

        return response()->json([
            'message' => 'Фильм успешно создан',
            'movie' => $movie->load('genre'),
        ], 201);
    }

    public function show(Movie $movie)
    {
        $movie->load(['genre', 'dvds'])
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
            'genre_id' => 'sometimes|required|exists:genres,id',
        ]);

        $movie->update($validated);

        return response()->json([
            'message' => 'Фильм успешно обновлен',
            'movie' => $movie->load('genre'),
        ], 200);
    }

    public function destroy(Movie $movie)
    {
        $movie->delete();

        return response()->json([
            'message' => 'Фильм успешно удален',
        ], 200);
    }
}