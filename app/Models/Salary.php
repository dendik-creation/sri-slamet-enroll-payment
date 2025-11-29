<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Salary extends Model
{
    protected $guarded = ['id'];
    protected $hidden = ['created_at', 'updated_at'];
    protected $casts = [
        'salary_date' => 'date',
        'period_start' => 'date',
        'period_end' => 'date',
        'employee_id' => 'integer',
    'total_work_days' => 'float',
        'total_overtime_hours' => 'float',
        'basic_salary' => 'integer',
        'overtime_salary' => 'integer',
        'total_deduction' => 'integer',
        'net_salary' => 'integer',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class)->withTrashed();
    }

    public function instalmentPayment()
    {
        return $this->hasOne(InstalmentPayment::class);
    }

    public function bonuses()
    {
        return $this->hasMany(SalaryBonus::class);
    }

    public function deductions()
    {
        return $this->hasMany(EmployeeDeduction::class);
    }
}
