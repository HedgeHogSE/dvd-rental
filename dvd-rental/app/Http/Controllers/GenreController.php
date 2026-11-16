<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use Illuminate\Http\Request;

class GenreController extends Controller
{
    public function index(Request $request)
    {
        $perPage = max(1, min($request->integer('per_page', 15), 100));

        return response()->json(Genre::paginate($perPage), 200);
    }

    public function show(Genre $genre)
    {
        return response()->json($genre, 200);
    }
}
