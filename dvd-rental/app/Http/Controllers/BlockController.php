<?php

namespace App\Http\Controllers;

use App\Models\Block;
use App\Services\BlockService;
use Illuminate\Http\Request;

class BlockController extends Controller
{
    public function __construct(
        private BlockService $blockService
    ) {}

    public function index()
    {
        $blocks = $this->blockService->getActiveBlocks();

        return response()->json($blocks, 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'reason' => 'required|string|max:255',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $block = $this->blockService->createBlock($validated);

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
        $this->blockService->removeBlock($block);

        return response()->json([
            'message' => 'Блокировка успешно снята',
        ], 200);
    }
}
