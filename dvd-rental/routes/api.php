<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlockController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DvdController;
use App\Http\Controllers\GenreController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RentalController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;

// Публичные маршруты
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/genres', [GenreController::class, 'index']);
Route::get('/genres/{genre}', [GenreController::class, 'show']);

Route::get('/movies', [MovieController::class, 'index']);
Route::get('/movies/{movie}', [MovieController::class, 'show']);

Route::get('/movies/{movie}/reviews', [ReviewController::class, 'index']);
Route::get('/movies/{movie}/rating', [ReviewController::class, 'rating']);

Route::get('/dvds', [DvdController::class, 'index']);
Route::get('/dvds/{dvd}', [DvdController::class, 'show']);

// Защищенные маршруты
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    // --- Личный кабинет (Wishlist) ---
    Route::get('/me/wishlist', [WishlistController::class, 'index']);
    Route::post('/me/wishlist', [WishlistController::class, 'store']);
    Route::delete('/me/wishlist/{movie}', [WishlistController::class, 'destroy']);

    // --- Уведомления ---
    Route::get('/me/notifications', [NotificationController::class, 'index']);
    Route::get('/me/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/me/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::put('/me/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // --- Управление контентом (только admin/employee) ---
    Route::middleware('role:admin,employee')->group(function () {
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

        Route::apiResource('blocks', BlockController::class)->except(['update']);

        Route::put('/reviews/{review}/moderate', [ReviewController::class, 'moderate']);
    });

    // --- Бронирования, Аренда и Отзывы (доступны авторизованным) ---
    Route::apiResource('bookings', BookingController::class);
    Route::apiResource('rentals', RentalController::class);
    
    Route::post('/movies/{movie}/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);
});