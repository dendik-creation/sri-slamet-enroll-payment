<?php

namespace App\Http\Controllers;

use App\Models\EmployeeDeduction;
use App\Models\Employee;
use App\Models\SalaryDeduction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class SalaryDeductionController extends Controller
{
    public function index(){
        $salary_deductions = SalaryDeduction::orderBy('name')->get();
        $employees = Employee::orderBy('name')->get(['id','name'])->map(function($e){
            return ['value' => $e->id, 'label' => $e->name];
        });

        return Inertia::render('Salary/Deduction/Index', [
            'title' => 'Potongan Gaji',
            'description' => 'Potongan yang akan diterapkan pada gaji karyawan',
            'salary_deductions' => $salary_deductions,
            'employees' => $employees,
        ]);
    }

    public function create(){
        $employees = Employee::orderBy('name')->get(['id','name'])->map(function($e){
            return ['value' => $e->id, 'label' => $e->name];
        });

        return Inertia::render('Salary/Deduction/Create', [
            'title' => 'Tambah Potongan Gaji',
            'description' => 'Buat potongan gaji baru',
            'employees' => $employees,
        ]);
    }

    public function show($id, Request $request){
        $salary_deduction = SalaryDeduction::findOrFail($id);
        if($salary_deduction->target_employee === SalaryDeduction::TARGET_SPECIFIC) {
            $specific_employee_ids = $salary_deduction->specific_employee_id ?? [];
            $specific_employees = Employee::whereIn('id', $specific_employee_ids)->pluck('name');
            $salary_deduction['specific_employees'] = $specific_employees;
        }
        $current_month = $request->input('month', date('n'));
        $current_year = date('Y');
        $employee_deductions = EmployeeDeduction::with('employee')->where('deduction_id', $id);
        $salary_deduction['received_amount_total'] = $employee_deductions->sum('amount');
        $employee_deductions = $employee_deductions->where('month', $current_month)->where('year', $current_year)->get();
        return Inertia::render('Salary/Deduction/Show', [
            'title' => 'Detail Potongan Gaji - '.$salary_deduction->name,
            'description' => 'Detail potongan gaji karyawan',
            'salary_deduction' => $salary_deduction,
            'employee_deductions' => $employee_deductions,
            'current_month' => $current_month,
            'current_year' => $current_year
        ]);
    }

    public function store(Request $request){
        $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'target_employee' => 'required|in:monthly,daily,all,specific',
            'specific_employee_id' => 'nullable|array',
            'specific_employee_id.*' => 'integer|exists:employees,id',
            'frequency' => 'nullable|in:per_payrun,monthly_once'
        ]);

        $data = $request->only(['name','amount','target_employee','frequency','specific_employee_id']);
        if(empty($data['frequency'])) {
            $data['frequency'] = SalaryDeduction::FREQ_PER_PAYRUN;
        }
        SalaryDeduction::create($data);
        Session::flash('success', 'Potongan gaji berhasil ditambahkan');
        return Inertia::location('/salary-deduction');
    }

    public function update(Request $request, SalaryDeduction $salaryDeduction){
        $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'target_employee' => 'required|in:monthly,daily,all,specific',
            'specific_employee_id' => 'nullable|array',
            'specific_employee_id.*' => 'integer|exists:employees,id',
            'frequency' => 'nullable|in:per_payrun,monthly_once'
        ]);

        $data = $request->only(['name','amount','target_employee','frequency','specific_employee_id']);
        if(empty($data['frequency'])) {
            $data['frequency'] = $salaryDeduction->frequency ?? SalaryDeduction::FREQ_PER_PAYRUN;
        }
        $salaryDeduction->update($data);
        Session::flash('success', 'Potongan gaji berhasil diperbarui');
        return Inertia::location('/salary-deduction');
    }

    public function edit(SalaryDeduction $salaryDeduction){
        $employees = Employee::all(['id','name'])->map(function($e){
            return ['value' => $e->id, 'label' => $e->name];
        });

        return Inertia::render('Salary/Deduction/Edit', [
            'title' => 'Edit Potongan Gaji - '.$salaryDeduction->name,
            'description' => 'Perbarui data potongan gaji',
            'salary_deduction' => $salaryDeduction,
            'employees' => $employees,
        ]);
    }

    public function destroy(SalaryDeduction $salaryDeduction){
        $salaryDeduction->delete();
        Session::flash('success', 'Potongan gaji berhasil dihapus');
        return Inertia::location('/salary-deduction');
    }

    public function print($salary_deduction_id, Request $request){
        $month = $request->input('month', date('n'));
        $year = $request->input('year', date('Y'));
        $salary_deduction = SalaryDeduction::findOrFail($salary_deduction_id);
        $employee_deductions = EmployeeDeduction::with('employee')->where('deduction_id', $salary_deduction_id)->where('month', $month)->where('year', $year)->get();

        return Inertia::render('Salary/Deduction/Print', [
            'title' => 'Laporan Potongan Gaji - '.$salary_deduction->name,
            'description' => 'CV Sri Slamet',
            'salary_deduction' => $salary_deduction,
            'employee_deductions' => $employee_deductions,
            'month' => $month,
            'year' => $year
        ]);
    }
}
