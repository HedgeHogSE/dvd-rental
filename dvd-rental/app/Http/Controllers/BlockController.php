<?php

namespace App\Http\Controllers;

use App\Models\Block;
use Illuminate\Http\Request;

class BlockController extends Controller
{
    /**
     * 8.1 & 8.2: Получить список только АКТИВНЫХ блокировок
     */
    public function index()
    {
        // Активной считается блокировка, у которой expires_at IS NULL ИЛИ expires_at в будущем
        $activeBlocks = Block::with('user')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($activeBlocks, 200);
    }

    /**
     * 8.1 & 8.2: Создать блокировку для пользователя
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'reason' => 'required|string|max:255',
            'expires_at' => 'nullable|date|after:now', // Если не передано — блокировка постоянная
        ]);

        $block = Block::create($validated);

        return response()->json([
            'message' => 'Пользователь успешно заблокирован',
            'block' => $block->load('user'),
        ], 201);
    }

    /**
     * Получить информацию о конкретной блокировке
     */
    public function show(Block $block)
    {
        return response()->json($block->load('user'), 200);
    }

    /**
     * 8.1: Снятие (удаление) блокировки
     */
    public function destroy(Block $block)
    {
        $block->delete();

        return response()->json([
            'message' => 'Блокировка успешно снята',
        ], 200);
    }
}
