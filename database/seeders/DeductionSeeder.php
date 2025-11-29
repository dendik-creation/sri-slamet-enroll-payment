<?php

namespace Database\Seeders;

use App\Models\SalaryDeduction;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DeductionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SalaryDeduction::create([
            'name' => 'Jamsostek',
            'amount' => 50000,
            'target_employee' => 'specific',
            'frequency' => SalaryDeduction::FREQ_MONTHLY_ONCE,
            'specific_employee_id' => [1,2,3],
        ]);
    }
}
