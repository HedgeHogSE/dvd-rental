<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! $user->roles()->whereIn('name', $roles)->exists()) {
            return response()->json([
                'message' => 'Доступ запрещен. Недостаточно прав.',
            ], 403);
        }

        return $next($request);
    }
}