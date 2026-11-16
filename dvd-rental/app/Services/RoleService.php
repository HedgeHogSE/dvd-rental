<?php

namespace App\Services;

use App\Models\Role;
use Illuminate\Validation\ValidationException;

class RoleService
{
    public function getAllRoles(): \Illuminate\Support\Collection
    {
        return Role::all();
    }

    public function getRoleById(int $id): Role
    {
        return Role::findOrFail($id);
    }

    public function createRole(array $data): Role
    {
        $this->validateRoleData($data);

        $role = Role::create([
            'name' => $data['name'],
        ]);

        return $role;
    }

    public function updateRole(Role $role, array $data): Role
    {
        $this->validateRoleData($data, $role->id);

        $role->update($data);

        return $role;
    }

    public function deleteRole(Role $role): void
    {
        $role->delete();
    }

    private function validateRoleData(array $data, ?int $roleId = null): void
    {
        $rules = [
            'name' => 'required|string|max:55|unique:roles,name',
        ];

        if ($roleId) {
            $rules['name'] = [
                'required',
                'string',
                'max:55',
                \Illuminate\Validation\Rule::unique('roles', 'name')->ignore($roleId),
            ];
        }

        $validator = \Illuminate\Support\Facades\Validator::make($data, $rules);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }
    }
}