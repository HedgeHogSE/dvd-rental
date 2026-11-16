<?php

namespace App\Services;

use App\Models\Genre;
use Illuminate\Validation\ValidationException;

class GenreService
{
    public function getAllGenres(): \Illuminate\Support\Collection
    {
        return Genre::all();
    }

    public function getGenreById(int $id): Genre
    {
        return Genre::findOrFail($id);
    }

    public function createGenre(array $data): Genre
    {
        $this->validateGenreData($data);

        $genre = Genre::create([
            'name' => $data['name'],
        ]);

        return $genre;
    }

    public function updateGenre(Genre $genre, array $data): Genre
    {
        $this->validateGenreData($data, $genre->id);

        $genre->update($data);

        return $genre;
    }

    public function deleteGenre(Genre $genre): void
    {
        $genre->delete();
    }

    private function validateGenreData(array $data, ?int $genreId = null): void
    {
        $rules = [
            'name' => 'required|string|max:255|unique:genres,name',
        ];

        if ($genreId) {
            $rules['name'] = [
                'required',
                'string',
                'max:255',
                \Illuminate\Validation\Rule::unique('genres', 'name')->ignore($genreId),
            ];
        }

        $validator = \Illuminate\Support\Facades\Validator::make($data, $rules);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }
    }
}