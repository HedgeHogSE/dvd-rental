<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Events\Failed;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(array $data): User
    {
        $this->validateRegisterData($data);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'] ?? null,
        ]);

        $clientRole = Role::where('name', 'client')->first();

        if (!$clientRole) {
            throw ValidationException::withMessages([
                'message' => ['Системная ошибка: роль "client" не найдена в базе данных. Обратитесь к администратору.'],
            ]);
        }

        $user->roles()->sync([$clientRole->id]);

        return $user->load('roles');
    }

    public function login(array $data): User
    {
        $this->validateLoginData($data);

        if (!Auth::attempt(['email' => $data['email'], 'password' => $data['password']])) {
            throw ValidationException::withMessages([
                'email' => ['Предоставленные учетные данные неверны.'],
            ]);
        }

        return User::with('roles')->where('email', $data['email'])->firstOrFail();
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function getCurrentUser(User $user): User
    {
        return $user->load('roles');
    }

    private function validateRegisterData(array $data): void
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
        ];

        $validator = \Illuminate\Support\Facades\Validator::make($data, $rules);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }
    }

    private function validateLoginData(array $data): void
    {
        $rules = [
            'email' => 'required|email',
            'password' => 'required|string',
        ];

        $validator = \Illuminate\Support\Facades\Validator::make($data, $rules);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }
    }
}