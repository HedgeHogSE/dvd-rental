<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserService
{
    public function getAllUsers(): \Illuminate\Support\Collection
    {
        return User::with('roles')->get();
    }

    public function getUserById(int $id): User
    {
        return User::with('roles')->findOrFail($id);
    }

    public function createUser(array $data): User
    {
        $this->validateUserData($data);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'] ?? null,
        ]);

        if (!empty($data['role_ids'])) {
            $user->roles()->sync($data['role_ids']);
        }

        return $user;
    }

    public function updateUser(User $user, array $data): User
    {
        $this->validateUpdateData($data, $user->id);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        return $user;
    }

    public function deleteUser(User $user): void
    {
        $user->delete();
    }

    public function assignRole(User $user, int $roleId): User
    {
        $role = Role::findOrFail($roleId);
        $user->roles()->syncWithoutDetaching([$roleId]);

        return $user;
    }

    public function removeRole(User $user, int $roleId): User
    {
        $role = Role::findOrFail($roleId);
        $user->roles()->detach($roleId);

        return $user;
    }

    private function validateUserData(array $data): void
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'exists:roles,id',
        ];

        $validator = \Illuminate\Support\Facades\Validator::make($data, $rules);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }
    }

    private function validateUpdateData(array $data, int $userId): void
    {
        $rules = [
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', 'max:255', \Illuminate\Validation\Rule::unique('users')->ignore($userId)],
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8',
        ];

        $validator = \Illuminate\Support\Facades\Validator::make($data, $rules);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }
    }
}