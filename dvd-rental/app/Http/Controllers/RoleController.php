<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    /**
     * Получить список всех ролей
     */
    public function index()
    {
        return response()->json(Role::all(), 200);
    }

    /**
     * Создать новую роль
     */
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

    /**
     * Получить информацию о конкретной роли
     */
    public function show(Role $role)
    {
        return response()->json($role, 200);
    }

    /**
     * Обновить существующую роль
     */
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            // Исключаем текущую роль из проверки уникальности при обновлении
            'name' => ['required', 'string', 'max:55', Rule::unique('roles', 'name')->ignore($role->id)],
        ]);

        $role->update($validated);

        return response()->json([
            'message' => 'Роль успешно обновлена',
            'role' => $role,
        ], 200);
    }

    /**
     * Удалить роль
     */
    public function destroy(Role $role)
    {
        $role->delete();

        return response()->json([
            'message' => 'Роль успешно удалена',
        ], 200);
    }
}
