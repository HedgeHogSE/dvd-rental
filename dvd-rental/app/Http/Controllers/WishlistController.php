<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = $user->wishlist()
            ->with('genres')
            ->withAvg(['reviews' => function ($q) {
                $q->where('status', 'published');
            }], 'rating');

        $perPage = max(1, min($request->integer('per_page', 15), 100));

        return response()->json(
            $query->orderByPivot('created_at', 'desc')->paginate($perPage), 
            200
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'movie_id' => 'required|exists:movies,id',
        ]);

        $user = $request->user();

        if ($user->wishlist()->where('movie_id', $validated['movie_id'])->exists()) {
            return response()->json([
                'message' => 'Фильм уже находится в вашем списке желаемого.',
            ], 409);
        }

        $user->wishlist()->attach($validated['movie_id']);

        return response()->json([
            'message' => 'Фильм успешно добавлен в список желаемого.',
        ], 201);
    }

    public function destroy(Request $request, Movie $movie)
    {
        $user = $request->user();

        $user->wishlist()->detach($movie->id);

        return response()->json([
            'message' => 'Фильм удален из списка желаемого.',
        ], 200);
    }
}
