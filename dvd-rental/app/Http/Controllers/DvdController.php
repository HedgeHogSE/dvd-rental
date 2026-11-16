<?php

namespace App\Http\Controllers;

use App\Models\Dvd;
use App\Services\DvdService;
use Illuminate\Http\Request;

class DvdController extends Controller
{
    public function __construct(
        private DvdService $dvdService
    ) {}

    public function index()
    {
        $dvds = $this->dvdService->getAllDvds();

        return response()->json($dvds, 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'inventory_number' => 'required|string|max:255',
            'status' => 'nullable|string|in:available,rented,reserved,unavailable',
            'price_per_day' => 'required|numeric|min:0',
        ]);

        $dvd = $this->dvdService->createDvd($validated);

        return response()->json([
            'message' => 'DVD успешно добавлен',
            'dvd' => $dvd->load('movie'),
        ], 201);
    }

    public function show(Dvd $dvd)
    {
        return response()->json($dvd->load('movie.genre'), 200);
    }

    public function update(Request $request, Dvd $dvd)
    {
        $validated = $request->validate([
            'movie_id' => 'sometimes|required|exists:movies,id',
            'inventory_number' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|string|in:available,rented,reserved,unavailable',
            'price_per_day' => 'sometimes|required|numeric|min:0',
        ]);

        $dvd = $this->dvdService->updateDvd($dvd, $validated);

        return response()->json([
            'message' => 'Информация о DVD успешно обновлена',
            'dvd' => $dvd->load('movie'),
        ], 200);
    }

    public function destroy(Dvd $dvd)
    {
        $this->dvdService->deleteDvd($dvd);

        return response()->json([
            'message' => 'DVD успешно удален',
        ], 200);
    }
}
