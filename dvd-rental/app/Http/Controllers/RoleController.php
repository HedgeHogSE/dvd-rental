<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $perPage = max(1, min($request->integer('per_page', 15), 100));

        return response()->json(Role::paginate($perPage), 200);
    }

    public function show(Role $role)
    {
        return response()->json($role, 200);
    }
}
