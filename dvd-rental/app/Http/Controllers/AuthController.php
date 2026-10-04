<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Регистрация нового пользователя
     */
    public function register(Request $request)
    {
        // Валидация входящих данных
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
        ]);

        // Создаем пользователя
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
        ]);

        // Создаем Sanctum API token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Пользователь успешно зарегистрирован',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Вход пользователя
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Проверяем логин и пароль
        if (!Auth::attempt(['email' => $validated['email'], 'password' => $validated['password']])) {
            throw ValidationException::withMessages([
                'email' => ['Предоставленные учетные данные неверны.'],
            ]);
        }

        $user = User::where('email', $validated['email'])->firstOrFail();

        // Создаем Sanctum API token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Авторизация прошла успешно',
            'user' => $user,
            'token' => $token,
        ], 200);
    }

    /**
     * Выход из системы (отзыв текущего токена)
     */
    public function logout(Request $request)
    {
        // Удаляем текущий токен, с которым сделан запрос
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Вы успешно вышли из системы',
        ], 200);
    }

    /**
     * Получение текущего авторизованного пользователя
     */
    public function me(Request $request)
    {
        // Возвращаем данные текущего пользователя с привязанными ролями
        return response()->json($request->user()->load('roles'));
    }
}
