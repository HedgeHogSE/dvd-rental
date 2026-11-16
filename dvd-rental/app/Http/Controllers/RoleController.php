<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Services\RoleService;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function __construct(
        private RoleService $roleService
    ) {}

    public function index()
    {
        $roles = $this->roleService->getAllRoles();

        return response()->json($roles, 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:55',
        ]);

        $role = $this->roleService->createRole($validated);

        return response()->json([
            'message' => 'Роль успешно создана',
            'role' => $role,
        ], 201);
    }

    public function show(Role $role)
    {
        return response()->json($role, 200);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:55',
        ]);

        $role = $this->roleService->updateRole($role, $validated);

        return response()->json([
            'message' => 'Роль успешно обновлена',
            'role' => $role,
        ], 200);
    }

    public function destroy(Role $role)
    {
        $this->roleService->deleteRole($role);

        return response()->json([
            'message' => 'Роль успешно удалена',
        ], 200);
    }
}
