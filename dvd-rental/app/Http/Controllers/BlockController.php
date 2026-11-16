<?php

namespace App\Http\Controllers;

use App\Models\Block;
use Illuminate\Http\Request;

class BlockController extends Controller
{
    public function index(Request $request)
    {
        $query = Block::with('user')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->orderBy('created_at', 'desc');

        $perPage = max(1, min($request->integer('per_page', 15), 100));

        return response()->json($query->paginate($perPage), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'reason' => 'required|string|max:255',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $block = Block::create($validated);

        return response()->json([
            'message' => 'Пользователь успешно заблокирован',
            'block' => $block->load('user'),
        ], 201);
    }

    public function show(Block $block)
    {
        return response()->json($block->load('user'), 200);
    }

    public function destroy(Block $block)
    {
        $block->delete();

        return response()->json([
            'message' => 'Блокировка успешно снята',
        ], 200);
    }
}
