<?php

namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class PositionController extends Controller
{
    public function index(){
        $positions = Position::orderBy('name')->get();
        return Inertia::render('Position/Index', [
            'title' => 'Daftar Jabatan',
            'description' => 'Jabatan yang tersedia di sistem ini',
            'positions' => $positions,
        ]);
    }

    public function store(Request $request){
        $request->validate([
            'name' => 'required|string|max:255',
        ]);
        Position::create($request->only('name'));
        Session::flash('success', 'Jabatan berhasil ditambahkan.');
        return Inertia::location('/position');
    }

    public function update(Request $request, Position $position){
        $request->validate([
            'name' => 'required|string|max:255',
        ]);
        $position->update($request->only('name'));
        Session::flash('success', 'Jabatan berhasil diperbarui.');
        return Inertia::location('/position');
    }

    public function destroy(Position $position){
        $position->delete();
        Session::flash('success', 'Jabatan berhasil dihapus.');
        return Inertia::location('/position');
    }
}
