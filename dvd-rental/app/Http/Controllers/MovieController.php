<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Services\MovieService;
use Illuminate\Http\Request;

class MovieController extends Controller
{
    public function __construct(
        private MovieService $movieService
    ) {}

    public function index(Request $request)
    {
        $movies = $this->movieService->getAllMovies(
            $request->search ?? null,
            $request->genre_id ?? null
        );

        return response()->json($movies, 200);
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

        $movie = $this->movieService->createMovie($validated);

        return response()->json([
            'message' => 'Фильм успешно создан',
            'movie' => $movie->load('genre'),
        ], 201);
    }

    public function show(Movie $movie)
    {
        return response()->json($movie->load('genre', 'dvds'), 200);
    }

    public function update(Request $request, $movie)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'release_year' => 'sometimes|required|integer|min:1888|max:' . (date('Y') + 1),
            'duration' => 'sometimes|required|integer|min:1',
            'genre_id' => 'sometimes|required|exists:genres,id',
        ]);

        $movie = $this->movieService->updateMovie($movie, $validated);

        return response()->json([
            'message' => 'Фильм успешно обновлен',
            'movie' => $movie->load('genre'),
        ], 200);
    }

    public function destroy($movie)
    {
        $this->movieService->deleteMovie($movie);

        return response()->json([
            'message' => 'Фильм успешно удален',
        ], 200);
    }
}
