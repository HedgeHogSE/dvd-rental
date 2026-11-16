<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->createRoles();
        $this->createAdminUser();
    }

    private function createRoles(): void
    {
        $roles = ['admin', 'employee', 'client'];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }
    }

    private function createAdminUser(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@dvd-rental.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'phone' => '+79990000000',
            ]
        );

        $admin->roles()->sync(Role::where('name', 'admin')->pluck('id'));
    }
}
