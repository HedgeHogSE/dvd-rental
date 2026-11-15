<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Models\Review;
use App\Models\Rental;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    public function index(Request $request, Movie $movie)
    {
        $query = $movie->reviews()->with('user')->where('status', 'published');

        $perPage = max(1, min($request->integer('per_page', 15), 100));

        return response()->json($query->orderBy('created_at', 'desc')->paginate($perPage), 200);
    }

    public function store(Request $request, Movie $movie)
    {
        $user = $request->user();

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:10',
            'text' => 'nullable|string|max:2000',
        ]);

        if ($movie->reviews()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Вы уже оставляли отзыв к этому фильму.'], 409);
        }

        $review = $movie->reviews()->create([
            'user_id' => $user->id,
            'rating' => $validated['rating'],
            'text' => $validated['text'] ?? null,
            'status' => 'published',
        ]);

        return response()->json([
            'message' => 'Отзыв успешно добавлен',
            'review' => $review->load('user'),
        ], 201);
    }

    public function update(Request $request, Review $review)
    {
        $this->authorize('update', $review);

        $validated = $request->validate([
            'rating' => 'sometimes|required|integer|min:1|max:10',
            'text' => 'nullable|string|max:2000',
        ]);

        $review->update($validated);

        return response()->json([
            'message' => 'Отзыв успешно обновлен',
            'review' => $review,
        ], 200);
    }

    public function destroy(Review $review)
    {
        $this->authorize('delete', $review);

        $review->delete();

        return response()->json([
            'message' => 'Отзыв успешно удален',
        ], 200);
    }

    public function moderate(Request $request, Review $review)
    {
        $this->authorize('moderate', Review::class);

        $validated = $request->validate([
            'status' => 'required|string|in:published,hidden',
        ]);

        $review->update([
            'status' => $validated['status'],
            'moderated_by' => $request->user()->id,
            'moderated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Статус отзыва обновлен',
            'review' => $review,
        ], 200);
    }
}