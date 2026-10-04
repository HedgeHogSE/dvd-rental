<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlockController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DvdController;
use App\Http\Controllers\GenreController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\RentalController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Публичные маршруты
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/genres', [GenreController::class, 'index']);
Route::get('/genres/{genre}', [GenreController::class, 'show']);

Route::get('/movies', [MovieController::class, 'index']);
Route::get('/movies/{movie}', [MovieController::class, 'show']);

Route::get('/dvds', [DvdController::class, 'index']);
Route::get('/dvds/{dvd}', [DvdController::class, 'show']);

// Защищенные маршруты
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    Route::apiResource('roles', RoleController::class);
    Route::apiResource('users', UserController::class);
    Route::post('/users/{user}/roles', [UserController::class, 'assignRole']);
    Route::delete('/users/{user}/roles/{role}', [UserController::class, 'removeRole']);

    Route::post('/genres', [GenreController::class, 'store']);
    Route::put('/genres/{genre}', [GenreController::class, 'update']);
    Route::delete('/genres/{genre}', [GenreController::class, 'destroy']);

    Route::post('/movies', [MovieController::class, 'store']);
    Route::put('/movies/{movie}', [MovieController::class, 'update']);
    Route::delete('/movies/{movie}', [MovieController::class, 'destroy']);

    Route::post('/dvds', [DvdController::class, 'store']);
    Route::put('/dvds/{dvd}', [DvdController::class, 'update']);
    Route::delete('/dvds/{dvd}', [DvdController::class, 'destroy']);

    Route::apiResource('bookings', BookingController::class);
    Route::apiResource('blocks', BlockController::class)->except(['update']);

    // Система аренды (/api/rentals)
    Route::apiResource('rentals', RentalController::class);
});
