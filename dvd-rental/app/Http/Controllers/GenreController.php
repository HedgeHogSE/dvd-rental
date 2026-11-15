<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GenreController extends Controller
{

    public function index(Request $request)
    {
        $perPage = max(1, min($request->integer('per_page', 15), 100));
        
        return response()->json(Genre::paginate($perPage), 200);
    }

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

    public function show(Genre $genre)
    {
        return response()->json($genre, 200);
    }

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

    public function destroy(Genre $genre)
    {
        $genre->delete();

        return response()->json([
            'message' => 'Жанр успешно удален',
        ], 200);
    }
}
