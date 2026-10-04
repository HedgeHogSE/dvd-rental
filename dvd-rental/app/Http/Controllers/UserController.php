<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Получить список всех пользователей с их ролями
     */
    public function index()
    {
        // Eager loading ролей через with('roles')
        return response()->json(User::with('roles')->get(), 200);
    }

    /**
     * Создать нового пользователя
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
        ]);

        // Если переданы ID ролей — привязываем их
        if (!empty($validated['role_ids'])) {
            $user->roles()->sync($validated['role_ids']);
        }

        return response()->json([
            'message' => 'Пользователь успешно создан',
            'user' => $user->load('roles'),
        ], 201);
    }

    /**
     * Получить данные конкретного пользователя с ролями
     */
    public function show(User $user)
    {
        return response()->json($user->load('roles'), 200);
    }

    /**
     * Обновить данные пользователя
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Данные пользователя успешно обновлены',
            'user' => $user->load('roles'),
        ], 200);
    }

    /**
     * Удалить пользователя
     */
    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'message' => 'Пользователь успешно удален',
        ], 200);
    }

    /**
     * Назначить роль пользователю
     */
    public function assignRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        // syncWithoutDetaching добавляет роль, не затирая имеющиеся
        $user->roles()->syncWithoutDetaching([$validated['role_id']]);

        return response()->json([
            'message' => 'Роль успешно назначена',
            'user' => $user->load('roles'),
        ], 200);
    }

    /**
     * Удалить роль у пользователя
     */
    public function removeRole(User $user, Role $role)
    {
        $user->roles()->detach($role->id);

        return response()->json([
            'message' => 'Роль успешно отвязана от пользователя',
            'user' => $user->load('roles'),
        ], 200);
    }
}
