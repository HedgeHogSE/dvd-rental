<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use Illuminate\Http\Request;

class MovieController extends Controller
{
    /**
     * Получить список всех фильмов с фильтрацией и поиском
     */
    public function index(Request $request)
    {
        // Начинаем билдер запроса с eager loading жанра
        $query = Movie::with('genre');

        // Поиск по названию (?search=текст)
        if ($request->has('search') && !empty($request->search)) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Фильтрация по genre_id (?genre_id=1)
        if ($request->has('genre_id') && !empty($request->genre_id)) {
            $query->where('genre_id', $request->genre_id);
        }

        return response()->json($query->get(), 200);
    }

    /**
     * Создать новый фильм
     */
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

    /**
     * Получить детальную информацию о фильме
     */
    public function show(Movie $movie)
    {
        return response()->json($movie->load('genre'), 200);
    }

    /**
     * Обновить фильм
     */
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

    /**
     * Удалить фильм
     */
    public function destroy(Movie $movie)
    {
        $movie->delete();

        return response()->json([
            'message' => 'Фильм успешно удален',
        ], 200);
    }
}
