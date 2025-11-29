<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeDeduction extends Model
{
    protected $fillable = [
        'salary_id',
        'deduction_id',
        'employee_id',
        'amount',
        'month',
        'year',
        'employee_id'
    ];

    protected $hidden = [
        'updated_at'
    ];

    protected $casts = [
        'amount' => 'integer',
        'month' => 'integer',
        'year' => 'integer'
    ];

    public function salary()
    {
        return $this->belongsTo(Salary::class);
    }

    public function deduction()
    {
        return $this->belongsTo(SalaryDeduction::class, 'deduction_id')->withTrashed()->orderBy('name', 'asc');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id')->withTrashed()->orderBy('name', 'asc');
    }

    public function scopeForPeriod($query, $employeeId, $deductionId, $month, $year)
    {
        return $query->where('employee_id', $employeeId)
            ->where('deduction_id', $deductionId)
            ->where('month', $month)
            ->where('year', $year);
    }
}
