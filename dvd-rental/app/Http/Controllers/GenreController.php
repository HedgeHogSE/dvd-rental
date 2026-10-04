<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GenreController extends Controller
{
    /**
     * Получить список всех жанров
     */
    public function index()
    {
        return response()->json(Genre::all(), 200);
    }

    /**
     * Создать новый жанр
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:genres,name',
        ]);

        $genre = Genre::create($validated);

        return response()->json([
            'message' => 'Жанр успешно создан',
            'genre' => $genre,
        ], 201);
    }

    /**
     * Получить информацию о конкретном жанре
     */
    public function show(Genre $genre)
    {
        return response()->json($genre, 200);
    }

    /**
     * Обновить существующий жанр
     */
    public function update(Request $request, Genre $genre)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('genres', 'name')->ignore($genre->id)],
        ]);

        $genre->update($validated);

        return response()->json([
            'message' => 'Жанр успешно обновлен',
            'genre' => $genre,
        ], 200);
    }

    /**
     * Удалить жанр
     */
    public function destroy(Genre $genre)
    {
        $genre->delete();

        return response()->json([
            'message' => 'Жанр успешно удален',
        ], 200);
    }
}
