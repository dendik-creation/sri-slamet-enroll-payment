<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Position;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    private function getAppSetting(){
        $setting = Setting::first();
        return $setting;
    }

    public function index(Request $request){
        $employee_type = $request->input('employee_type') ?: null;
        $employees = Employee::with('position')
            ->when($request->search, function($query) use ($request){
                $query->where('nip', 'like', '%'.$request->search.'%')
                      ->orWhere('name', 'like', '%'.$request->search.'%');
            })
            ->when($employee_type, function($query) use ($employee_type){
                $query->where('salary_type', $employee_type);
            })
            ->orderBy('name')
            ->paginate(10);

        return Inertia::render('Employee/Index', [
            'employees' => $employees,
            'setting'  => $this->getAppSetting(),
            'search' => $request->search ?: null,
            'employee_type' => $employee_type,
            'title' => "Daftar Karyawan",
            'description' => "Daftar karyawan yang bekerja di perusahaan ini.",
        ]);
    }

    public function create(){
        $positions = Position::all()->map(function($position){
            return [
                'value' => $position->id,
                'label' => $position->name,
            ];
        });
        return Inertia::render('Employee/Create', [
            'positions' => $positions,
            'title' => "Tambah Karyawan",
            'description' => "Lengkapi form untuk menambahkan karyawan baru.",
        ]);
    }

    public function store(Request $request){
        $request->validate([
            'nip' => 'required',
            'name' => 'required|string|max:255',
            'position_id' => 'required|exists:positions,id',
            'join_date' => 'required|date',
            'salary_type' => 'required|in:monthly,daily',
            'salary_per_day' => 'required|numeric|min:0',
            'salary_per_month' => 'nullable|numeric|min:0',
        ]);

        Employee::create($request->all());
        Session::flash('success', 'Karyawan berhasil ditambahkan.');
        return Inertia::location('/employee');
    }

    public function edit(Employee $employee){
        $positions = Position::all()->map(function($position){
            return [
                'value' => $position->id,
                'label' => $position->name,
            ];
        });

        return Inertia::render('Employee/Edit', [
            'employee' => $employee,
            'positions' => $positions,
            'title' => "Edit Karyawan",
            'description' => "Ubah informasi karyawan ini.",
        ]);
    }

    public function update(Request $request, Employee $employee){
        $request->validate([
            'nip' => 'required',
            'name' => 'required|string|max:255',
            'position_id' => 'required|exists:positions,id',
            'join_date' => 'required|date',
            'salary_type' => 'required|in:monthly,daily',
            'salary_per_day' => 'required|numeric|min:0',
            'salary_per_month' => 'nullable|numeric|min:0',
        ]);

        $employee->update($request->all());
        Session::flash('success', 'Karyawan berhasil diperbarui.');
        return Inertia::location('/employee');
    }

    public function destroy(Employee $employee){
        $employee->delete();
        Session::flash('success', 'Karyawan berhasil dihapus.');
        return Inertia::location('/employee');
    }
}
