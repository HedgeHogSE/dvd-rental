<?php

namespace App\Services;

use App\Models\Genre;
use App\Models\Movie;
use Illuminate\Validation\ValidationException;

class MovieService
{
    public function getAllMovies(?string $search = null, ?int $genreId = null): \Illuminate\Support\Collection
    {
        $query = Movie::with('genre');

        if ($search) {
            $query->where('title', 'like', '%' . $search . '%');
        }

        if ($genreId) {
            $query->where('genre_id', $genreId);
        }

        return $query->get();
    }

    public function getMovieById(int $id): Movie
    {
        return Movie::with('genre')->findOrFail($id);
    }

    public function createMovie(array $data): Movie
    {
        $this->validateMovieData($data);

        $movie = Movie::create($data);

        return $movie;
    }

    public function updateMovie(Movie $movie, array $data): Movie
    {
        $this->validateMovieData($data, $movie->id);

        $movie->update($data);

        return $movie;
    }

    public function deleteMovie(Movie $movie): void
    {
        $movie->delete();
    }

    private function validateMovieData(array $data, ?int $movieId = null): void
    {
        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'release_year' => 'required|integer|min:1888|max:' . (date('Y') + 1),
            'duration' => 'required|integer|min:1',
            'genre_id' => 'required|exists:genres,id',
        ];

        $validator = \Illuminate\Support\Facades\Validator::make($data, $rules);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }
    }
}