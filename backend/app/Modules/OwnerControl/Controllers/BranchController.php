<?php

namespace App\Modules\OwnerControl\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Modules\OwnerControl\Models\Branch;
use Exception;

/**
 * Class BranchController
 * 
 * Manages Dynamic Geofencing Locations/Branches CRUD for Owner/SuperAdmin.
 */
class BranchController extends Controller
{
    /**
     * Display a listing of all branches.
     */
    public function index(): JsonResponse
    {
        try {
            $branches = Branch::withCount('employees')->orderBy('id', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $branches,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve branches: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get active branches for employee GPS verification and mobile map rendering.
     */
    public function activeBranches(): JsonResponse
    {
        try {
            $branches = Branch::where('is_active', true)->get();

            return response()->json([
                'success' => true,
                'data' => $branches,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve active branches: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created branch / geofence zone.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius_meters' => 'required|integer|min:10|max:1000000',
            'is_active' => 'nullable|boolean',
        ]);

        try {
            $branch = Branch::create([
                'name' => $validated['name'],
                'latitude' => (float)$validated['latitude'],
                'longitude' => (float)$validated['longitude'],
                'radius_meters' => (int)$validated['radius_meters'],
                'is_active' => $validated['is_active'] ?? true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Geofence branch created successfully.',
                'data' => $branch,
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create branch: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified branch.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $branch = Branch::find($id);

            if (!$branch) {
                return response()->json([
                    'success' => false,
                    'message' => 'Branch not found.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $branch,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified branch.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $branch = Branch::find($id);

        if (!$branch) {
            return response()->json([
                'success' => false,
                'message' => 'Branch not found.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'latitude' => 'sometimes|required|numeric|between:-90,90',
            'longitude' => 'sometimes|required|numeric|between:-180,180',
            'radius_meters' => 'sometimes|required|integer|min:10|max:1000000',
            'is_active' => 'nullable|boolean',
        ]);

        try {
            $branch->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Geofence branch updated successfully.',
                'data' => $branch,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update branch: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified branch.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $branch = Branch::find($id);

            if (!$branch) {
                return response()->json([
                    'success' => false,
                    'message' => 'Branch not found.',
                ], 404);
            }

            $branch->delete();

            return response()->json([
                'success' => true,
                'message' => 'Geofence branch deleted successfully.',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete branch: ' . $e->getMessage(),
            ], 500);
        }
    }
}
