<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalaryDeduction extends Model
{
    use SoftDeletes;
    protected $guarded =['id'];
    protected $hidden = ['created_at', 'updated_at'];
    protected $casts = [
        'amount' => 'integer',
        'target_employee' => 'string',
        'frequency' => 'string',
        'specific_employee_id' => 'array',
    ];

    // Frequency constants
    public const FREQ_PER_PAYRUN = 'per_payrun';
    public const FREQ_MONTHLY_ONCE = 'monthly_once';
    // Target constants
    public const TARGET_ALL = 'all';
    public const TARGET_DAILY = 'daily';
    public const TARGET_MONTHLY = 'monthly';
    public const TARGET_SPECIFIC = 'specific';

    public static function frequencies(): array
    {
        return [self::FREQ_PER_PAYRUN, self::FREQ_MONTHLY_ONCE];
    }

    public function employeeDeductions()
    {
        return $this->hasMany(EmployeeDeduction::class, 'deduction_id');
    }
}
