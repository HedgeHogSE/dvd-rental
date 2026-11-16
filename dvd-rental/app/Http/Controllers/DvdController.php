<?php

namespace App\Http\Controllers;

use App\Models\Dvd;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DvdController extends Controller
{
    public function index(Request $request)
    {
        $query = Dvd::with('movie.genres');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->boolean('bookable')) {
            $query->where('status', '!=', 'unavailable');
        }

        if ($request->boolean('available_for_issue')) {
            $query->availableForIssue();
        }

        if ($request->filled('movie_id')) {
            $query->where('movie_id', $request->integer('movie_id'));
        }

        if ($request->filled('search')) {
            $query->where('inventory_number', 'like', '%' . $request->input('search') . '%');
        }

        $perPage = max(1, min($request->integer('per_page', 15), 100));

        return response()->json($query->paginate($perPage), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'inventory_number' => 'required|string|max:255|unique:dvds,inventory_number',
            'status' => 'nullable|string|in:available,rented,reserved,unavailable',
            'price_per_day' => 'required|numeric|min:0',
        ]);

        $dvd = Dvd::create($validated);

        return response()->json([
            'message' => 'DVD успешно добавлен',
            'dvd' => $dvd->load('movie.genres'),
        ], 201);
    }

    public function availability(Dvd $dvd)
    {
        $today = today()->toDateString();
        return response()->json([
            'today' => $today,
            'unavailable' => $dvd->status === 'unavailable',
            'bookings' => $dvd->activeBookings()
                ->where('end_date', '>=', $today)
                ->orderBy('start_date')
                ->get(['start_date', 'end_date']),
            'rental' => $dvd->rentalPeriod(),
        ]);
    }

    public function show(Dvd $dvd)
    {
        return response()->json($dvd->load('movie.genres'), 200);
    }

    public function update(Request $request, Dvd $dvd)
    {
        $validated = $request->validate([
            'movie_id' => 'sometimes|required|exists:movies,id',
            'inventory_number' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('dvds', 'inventory_number')->ignore($dvd->id),
            ],
            'status' => 'sometimes|required|string|in:available,rented,reserved,unavailable',
            'price_per_day' => 'sometimes|required|numeric|min:0',
        ]);

        $dvd->update($validated);

        return response()->json([
            'message' => 'Информация о DVD успешно обновлена',
            'dvd' => $dvd->load('movie.genres'),
        ], 200);
    }

    public function destroy(Dvd $dvd)
    {
        $dvd->delete();

        return response()->json([
            'message' => 'DVD успешно удален',
        ], 200);
    }
}
