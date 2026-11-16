<?php

namespace App\Services;

use App\Models\Dvd;
use Illuminate\Validation\ValidationException;

class DvdService
{
    public function getAllDvds(): \Illuminate\Support\Collection
    {
        return Dvd::with('movie.genre')->get();
    }

    public function getDvdById(int $id): Dvd
    {
        return Dvd::with('movie.genre')->findOrFail($id);
    }

    public function createDvd(array $data): Dvd
    {
        $this->validateDvdData($data);

        $dvd = Dvd::create([
            'movie_id' => $data['movie_id'],
            'inventory_number' => $data['inventory_number'],
            'status' => $data['status'] ?? 'available',
            'price_per_day' => $data['price_per_day'],
        ]);

        return $dvd;
    }

    public function updateDvd(Dvd $dvd, array $data): Dvd
    {
        $this->validateDvdData($data, $dvd->id);

        $dvd->update($data);

        return $dvd;
    }

    public function deleteDvd(Dvd $dvd): void
    {
        $dvd->delete();
    }

    public function updateDvdStatus(Dvd $dvd, string $status): Dvd
    {
        $this->validateStatus($status);
        $dvd->update(['status' => $status]);

        return $dvd;
    }

    public function checkDvdAvailability(Dvd $dvd): bool
    {
        if ($dvd->status === 'unavailable') {
            return false;
        }

        return true;
    }

    private function validateDvdData(array $data, ?int $dvdId = null): void
    {
        $rules = [
            'movie_id' => 'required|exists:movies,id',
            'inventory_number' => 'required|string|max:255|unique:dvds,inventory_number',
            'status' => 'nullable|string|in:available,rented,reserved,unavailable',
            'price_per_day' => 'required|numeric|min:0',
        ];

        if ($dvdId) {
            $rules['inventory_number'] = [
                'sometimes',
                'required',
                'string',
                'max:255',
                \Illuminate\Validation\Rule::unique('dvds', 'inventory_number')->ignore($dvdId),
            ];
        }

        $validator = \Illuminate\Support\Facades\Validator::make($data, $rules);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }
    }

    private function validateStatus(string $status): void
    {
        if (!in_array($status, ['available', 'rented', 'reserved', 'unavailable'])) {
            throw ValidationException::withMessages([
                'status' => ['Недопустимый статус DVD.'],
            ]);
        }
    }
}