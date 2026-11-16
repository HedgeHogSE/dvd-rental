<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Services\UserService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService
    ) {}

    public function index()
    {
        $users = $this->userService->getAllUsers();

        return response()->json($users, 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        $user = $this->userService->createUser($validated);

        return response()->json([
            'message' => 'Пользователь успешно создан',
            'user' => $user->load('roles'),
        ], 201);
    }

    public function show(User $user)
    {
        return response()->json($user->load('roles'), 200);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8',
        ]);

        $user = $this->userService->updateUser($user, $validated);

        return response()->json([
            'message' => 'Данные пользователя успешно обновлены',
            'user' => $user->load('roles'),
        ], 200);
    }

    public function destroy(User $user)
    {
        $this->userService->deleteUser($user);

        return response()->json([
            'message' => 'Пользователь успешно удален',
        ], 200);
    }

    public function assignRole(Request $request, User $user)
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $user = $this->userService->assignRole($user, $validated['role_id']);

        return response()->json([
            'message' => 'Роль успешно назначена',
            'user' => $user->load('roles'),
        ], 200);
    }

    public function removeRole(User $user, Role $role)
    {
        $this->userService->removeRole($user, $role->id);

        return response()->json([
            'message' => 'Роль успешно отвязана от пользователя',
            'user' => $user->load('roles'),
        ], 200);
    }
}
