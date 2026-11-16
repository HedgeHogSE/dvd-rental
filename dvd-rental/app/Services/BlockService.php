<?php

namespace App\Services;

use App\Models\Block;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class BlockService
{
    public function getActiveBlocks(): \Illuminate\Support\Collection
    {
        return Block::with('user')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function createBlock(array $data): Block
    {
        $this->validateBlockData($data);

        $user = User::findOrFail($data['user_id']);

        $block = Block::create([
            'user_id' => $user->id,
            'reason' => $data['reason'],
            'expires_at' => $data['expires_at'] ?? null,
        ]);

        return $block;
    }

    public function removeBlock(Block $block): void
    {
        $block->delete();
    }

    public function isUserBlocked(User $user): bool
    {
        return Block::where('user_id', $user->id)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->exists();
    }

    private function validateBlockData(array $data): void
    {
        $rules = [
            'user_id' => 'required|exists:users,id',
            'reason' => 'required|string|max:255',
            'expires_at' => 'nullable|date|after:now',
        ];

        $validator = \Illuminate\Support\Facades\Validator::make($data, $rules);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }
    }
}