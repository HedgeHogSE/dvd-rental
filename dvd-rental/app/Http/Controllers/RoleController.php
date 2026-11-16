<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $perPage = max(1, min($request->integer('per_page', 15), 100));

        return response()->json(Role::paginate($perPage), 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:55|unique:roles,name',
        ]);

        $role = Role::create($validated);

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
            'name' => ['required', 'string', 'max:55', Rule::unique('roles', 'name')->ignore($role->id)],
        ]);

        $role->update($validated);

        return response()->json([
            'message' => 'Роль успешно обновлена',
            'role' => $role,
        ], 200);
    }

    public function destroy(Role $role)
    {
        $role->delete();

        return response()->json([
            'message' => 'Роль успешно удалена',
        ], 200);
    }
}
