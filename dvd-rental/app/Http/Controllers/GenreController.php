<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use App\Services\GenreService;
use Illuminate\Http\Request;

class GenreController extends Controller
{
    public function __construct(
        private GenreService $genreService
    ) {}

    public function index()
    {
        $genres = $this->genreService->getAllGenres();

        return response()->json($genres, 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $genre = $this->genreService->createGenre($validated);

        return response()->json([
            'message' => 'Жанр успешно создан',
            'genre' => $genre,
        ], 201);
    }

    public function show(Genre $genre)
    {
        return response()->json($genre, 200);
    }

    public function update(Request $request, Genre $genre)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $genre = $this->genreService->updateGenre($genre, $validated);

        return response()->json([
            'message' => 'Жанр успешно обновлен',
            'genre' => $genre,
        ], 200);
    }

    public function destroy(Genre $genre)
    {
        $this->genreService->deleteGenre($genre);

        return response()->json([
            'message' => 'Жанр успешно удален',
        ], 200);
    }
}
