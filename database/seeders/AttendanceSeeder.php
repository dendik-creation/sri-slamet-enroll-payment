<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */

    public function run(): void
    {
        $employees = DB::table('employees')->get();
        $attendances = [];

        // Seed one recent period for demo purposes
        $now = Carbon::now();
        foreach ($employees as $employee) {
            if ($employee->salary_type === 'daily') {
                // One pay period: Saturday (previous week) to Friday (current week), skipping Sunday
                $monday = $now->copy()->startOfWeek(Carbon::MONDAY);
                $saturday = $monday->copy()->subDays(2);
                $friday = $monday->copy()->addDays(4);

                // Count work days between Saturday and Friday, excluding Sunday
                $workDays = 0;
                for ($date = $saturday->copy(); $date->lte($friday); $date->addDay()) {
                    if (!$date->isSunday()) {
                        $workDays += 1;
                    }
                }

                // Assume 1 hour overtime per work day for demo purposes
                $overtimeHours = (float) $workDays * 1.0;
                $attendances[] = [
                    'employee_id' => $employee->id,
                    'period_start' => $saturday->format('Y-m-d'),
                    'period_end' => $friday->format('Y-m-d'),
                    'work_days' => (float) $workDays,
                    'overtime' => $overtimeHours,
                    'is_used' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            } else {
                // One month period
                $startDate = $now->copy()->startOfMonth();
                $endDate = $now->copy()->endOfMonth();
                // Count weekdays in the month
                $workDays = 0;
                for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
                    if ($date->isWeekday()) {
                        $workDays += 1;
                    }
                }
                $attendances[] = [
                    'employee_id' => $employee->id,
                    'period_start' => $startDate->format('Y-m-d'),
                    'period_end' => $endDate->format('Y-m-d'),
                    'work_days' => (float) $workDays,
                    'overtime' => 0.0,
                    'is_used' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        if (!empty($attendances)) {
            DB::table('attendances')->insert($attendances);
        }
    }
}
