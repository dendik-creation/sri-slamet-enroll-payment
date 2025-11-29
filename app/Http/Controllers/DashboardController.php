<?php

namespace App\Http\Controllers;

use App\Models\Salary;
use App\Models\Employee;
use App\Models\Attendance;
use App\Models\ThrBonus;
use App\Models\InstalmentPayment;
use App\Models\EmployeeDeduction;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    private function getWeekRange()
    {
        $today = \Carbon\Carbon::today();
        $monday = $today->copy()->startOfWeek(\Carbon\Carbon::MONDAY);
        $friday = $monday->copy()->addDays(4);
        $previousSaturday = $monday->copy()->subDays(2);

        return [
            'start_date' => $previousSaturday->format('Y-m-d'),
            'end_date' => $friday->format('Y-m-d'),
        ];
    }
    
    public function index()
    {
        // Get current month data
        $currentMonth = Carbon::now();
        $startOfMonth = $currentMonth->copy()->startOfMonth();
        $endOfMonth = $currentMonth->copy()->endOfMonth();
        
        // Basic counts
        $totalEmployees = Employee::count();
        
        // Salary data for current month
        $salariesThisMonth = Salary::whereBetween('salary_date', [$startOfMonth, $endOfMonth]);
        $totalSalariesThisMonth = $salariesThisMonth->sum('net_salary');
        $totalBasicSalariesThisMonth = $salariesThisMonth->sum('basic_salary');
        $totalOvertimeSalariesThisMonth = $salariesThisMonth->sum('overtime_salary');
        $totalDeductionsThisMonth = $salariesThisMonth->sum('total_deduction');
        $totalTransactionsThisMonth = $salariesThisMonth->count();
        
        // Instalment payments this month
        $instalmentPaymentsThisMonth = InstalmentPayment::whereHas('salary', function($query) use ($startOfMonth, $endOfMonth) {
            $query->whereBetween('salary_date', [$startOfMonth, $endOfMonth]);
        })->sum('payment_value');
        
        // THR bonus data for current year
        $currentYear = $currentMonth->year;
        $totalThrThisYear = ThrBonus::where('year', $currentYear)->sum('total_amount');
        $totalThrTransactionsThisYear = ThrBonus::where('year', $currentYear)->count();
        
        // Get last 6 months salary trend
        $salaryTrend = collect();
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $startMonth = $month->copy()->startOfMonth();
            $endMonth = $month->copy()->endOfMonth();
            
            $monthSalaryTotal = Salary::whereBetween('salary_date', [$startMonth, $endMonth])->sum('net_salary');
            $monthInstalmentTotal = InstalmentPayment::whereHas('salary', function($query) use ($startMonth, $endMonth) {
                $query->whereBetween('salary_date', [$startMonth, $endMonth]);
            })->sum('payment_value');
            $monthThrTotal = ThrBonus::where('year', $month->year)->sum('total_amount');
            
            $salaryTrend->push([
                'month' => $month->format('M Y'),
                'total' => $monthSalaryTotal,
                'instalment_total' => $monthInstalmentTotal,
                'thr_total' => $monthThrTotal,
                'combined_total' => $monthSalaryTotal + $monthInstalmentTotal + $monthThrTotal,
            ]);
        }
        
        // Get current week (Mon-Fri) activity using attendance period overlap
        $weekRange = $this->getWeekRange();
        $weekStart = Carbon::parse($weekRange['start_date']);
        $weekEnd = Carbon::parse($weekRange['end_date']);

        $dailyActivity = collect();
        for ($date = $weekStart->copy(); $date->lte($weekEnd); $date->addDay()) {
            $dailySalary = Salary::whereDate('salary_date', $date)->sum('net_salary');
            $dailyInstalment = InstalmentPayment::whereHas('salary', function($query) use ($date) {
                $query->whereDate('salary_date', $date);
            })->sum('payment_value');
            // Attendance records cover a period; count if the day falls within period_start..period_end
            $dailyAttendance = Attendance::whereDate('period_start', '<=', $date)
                ->whereDate('period_end', '>=', $date)
                ->count();

            $dailyActivity->push([
                'date' => $date->format('d M'),
                'salary' => $dailySalary + $dailyInstalment,
                'attendance' => $dailyAttendance,
            ]);
        }
        
        // Employee salary distribution by position
        $salaryByPosition = Salary::with('employee.position')
            ->whereBetween('salary_date', [$startOfMonth, $endOfMonth])
            ->get()
            ->groupBy('employee.position.name')
            ->map(function ($salaries, $position) {
                return [
                    'position' => $position ?? 'Unknown',
                    'total' => $salaries->sum('net_salary'),
                    'count' => $salaries->count(),
                ];
            })
            ->values();
            
        // Top 5 highest paid employees this month (net salary + instalment payments)
        $topEmployees = Salary::with('employee', 'instalmentPayment')
            ->whereBetween('salary_date', [$startOfMonth, $endOfMonth])
            ->get()
            ->map(function ($salary) {
                $instalmentAmount = $salary->instalmentPayment ? $salary->instalmentPayment->payment_value : 0;
                return [
                    'name' => $salary->employee->name,
                    'nip' => $salary->employee->nip,
                    'total' => $salary->net_salary + $instalmentAmount,
                    'net_salary' => $salary->net_salary,
                    'instalment_payment' => $instalmentAmount,
                ];
            })
            ->groupBy('nip')
            ->map(function ($salaries) {
                $totalSalary = $salaries->sum('net_salary');
                $totalInstalment = $salaries->sum('instalment_payment');
                $firstSalary = $salaries->first();
                
                return [
                    'name' => $firstSalary['name'],
                    'nip' => $firstSalary['nip'],
                    'total' => $totalSalary + $totalInstalment,
                    'net_salary' => $totalSalary,
                    'instalment_payment' => $totalInstalment,
                ];
            })
            ->sortByDesc('total')
            ->take(5)
            ->values();
            
        // Calculate total combined expense for this month
        $totalCombinedThisMonth = $totalSalariesThisMonth + $instalmentPaymentsThisMonth + $totalThrThisYear;
        
        // Previous month comparison
        $previousMonth = Carbon::now()->subMonth();
        $previousStart = $previousMonth->copy()->startOfMonth();
        $previousEnd = $previousMonth->copy()->endOfMonth();
        $previousSalaryTotal = Salary::whereBetween('salary_date', [$previousStart, $previousEnd])->sum('net_salary');
        $previousInstalmentTotal = InstalmentPayment::whereHas('salary', function($query) use ($previousStart, $previousEnd) {
            $query->whereBetween('salary_date', [$previousStart, $previousEnd]);
        })->sum('payment_value');
        
        $previousYear = $currentYear - 1;
        $previousThrTotal = ThrBonus::where('year', $previousYear)->sum('total_amount');
        $previousCombinedTotal = $previousSalaryTotal + $previousInstalmentTotal + $previousThrTotal;
        
        $percentageChange = $previousCombinedTotal > 0 
            ? (($totalCombinedThisMonth - $previousCombinedTotal) / $previousCombinedTotal) * 100 
            : 0;

        return inertia('Dashboard', [
            'title' => "Dashboard",
            'summary' => [
                'total_employees' => $totalEmployees,
                'total_salaries_this_month' => $totalSalariesThisMonth,
                'total_basic_salaries_this_month' => $totalBasicSalariesThisMonth,
                'total_overtime_salaries_this_month' => $totalOvertimeSalariesThisMonth,
                'total_deductions_this_month' => $totalDeductionsThisMonth,
                'total_instalment_payments_this_month' => $instalmentPaymentsThisMonth,
                'total_thr_this_year' => $totalThrThisYear,
                'total_combined_this_month' => $totalCombinedThisMonth,
                'total_transactions_this_month' => $totalTransactionsThisMonth,
                'total_thr_transactions_this_year' => $totalThrTransactionsThisYear,
                'average_salary_per_employee' => $totalEmployees > 0 ? $totalSalariesThisMonth / $totalEmployees : 0,
                'percentage_change' => round($percentageChange, 2),
                'current_month' => $currentMonth->format('F Y'),
                'current_year' => $currentYear,
            ],
            'charts' => [
                'salary_trend' => $salaryTrend,
                'daily_activity' => $dailyActivity,
                'salary_by_position' => $salaryByPosition,
            ],
            'top_employees' => $topEmployees,
        ]);
    }

    public function expenseView(Request $request){
        $startDate = $request->get('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        
        // Get salary expenses in date range
        $salaries = Salary::with(['employee.position', 'instalmentPayment'])
            ->whereBetween('salary_date', [$startDate, $endDate])
            ->orderBy(Employee::select('name')->whereColumn('employees.id', 'salaries.employee_id'))
            ->get();
            
        // Get THR bonus expenses in date range (filter by year based on paid_at date)
        $startYear = Carbon::parse($startDate)->year;
        $endYear = Carbon::parse($endDate)->year;
        $thrBonuses = ThrBonus::with(['employee_thrs.employee.position'])
            ->where(function($query) use ($startYear, $endYear) {
                $query->where('year', $startYear)->orWhere('year', $endYear);
            })
            ->get();
            
        // Calculate salary totals
        $totalSalaryExpense = $salaries->sum('net_salary');
        $totalBasicSalary = $salaries->sum('basic_salary');
        $totalOvertimeSalary = $salaries->sum('overtime_salary');
        $totalSalaryDeductions = $salaries->sum('total_deduction');
        
        // Calculate instalment payments totals
        $totalInstalmentPayments = $salaries->sum(function($salary) {
            return $salary->instalmentPayment ? $salary->instalmentPayment->payment_value : 0;
        });
        
        // Calculate THR totals
        $totalThrExpense = $thrBonuses->sum('total_amount');
        
        // Calculate combined totals
        $totalExpense = $totalSalaryExpense + $totalInstalmentPayments + $totalThrExpense;
        
        // Group by employee - combine salary and THR data
        $expenseByEmployee = $salaries->groupBy('employee_id')->map(function ($employeeSalaries) {
            $employee = $employeeSalaries->first()->employee;
            $totalNetSalary = $employeeSalaries->sum('net_salary');
            $totalBasicSalary = $employeeSalaries->sum('basic_salary');
            $totalOvertimeSalary = $employeeSalaries->sum('overtime_salary');
            $totalDeductions = $employeeSalaries->sum('total_deduction');
            $totalInstalmentPayments = $employeeSalaries->sum(function($salary) {
                return $salary->instalmentPayment ? $salary->instalmentPayment->payment_value : 0;
            });
            
            return [
                'employee' => $employee,
                'total_net_salary' => $totalNetSalary,
                'total_basic_salary' => $totalBasicSalary,
                'total_overtime_salary' => $totalOvertimeSalary,
                'total_deductions' => $totalDeductions,
                'total_instalment_payments' => $totalInstalmentPayments,
                'salary_count' => $employeeSalaries->count(),
                'thr_amount' => 0, // Will be updated below
                'total_expense' => $totalNetSalary + $totalInstalmentPayments,
            ];
        });
        
        // Add THR data to employee expense tracking (avoid indirect modification of Collection elements)
        foreach ($thrBonuses as $thrBonus) {
            foreach ($thrBonus->employee_thrs as $employeeThr) {
                $employeeId = $employeeThr->employee_id;

                if ($expenseByEmployee->has($employeeId)) {
                    // Use get/put to modify the array stored in the Collection
                    $existing = $expenseByEmployee->get($employeeId);
                    $existing['thr_amount'] += $employeeThr->amount;
                    $existing['total_expense'] += $employeeThr->amount;
                    $expenseByEmployee->put($employeeId, $existing);
                } else {
                    // Employee has THR but no salary in this period
                    $expenseByEmployee->put($employeeId, [
                        'employee' => $employeeThr->employee,
                        'total_net_salary' => 0,
                        'total_basic_salary' => 0,
                        'total_overtime_salary' => 0,
                        'total_deductions' => 0,
                        'total_instalment_payments' => 0,
                        'salary_count' => 0,
                        'thr_amount' => $employeeThr->amount,
                        'total_expense' => $employeeThr->amount,
                    ]);
                }
            }
        }
        
        $expenseByEmployee = $expenseByEmployee->values();
        
        // Group by date for daily expense tracking
        $expenseByDate = $salaries->groupBy(function($salary) {
            return $salary->salary_date->format('Y-m-d');
        })->map(function($dailySalaries, $date) use ($thrBonuses) {
            $dailySalaryExpense = $dailySalaries->sum('net_salary');
            $dailyInstalmentExpense = $dailySalaries->sum(function($salary) {
                return $salary->instalmentPayment ? $salary->instalmentPayment->payment_value : 0;
            });
            $employeeCount = $dailySalaries->groupBy('employee_id')->count();
            
            // Get THR expense for this date (if any THR was distributed on this date)
            $dailyThrExpense = 0; // THR is typically distributed annually, not daily
            
            return [
                'date' => $date,
                'total_expense' => $dailySalaryExpense + $dailyInstalmentExpense + $dailyThrExpense,
                'salary_expense' => $dailySalaryExpense,
                'instalment_expense' => $dailyInstalmentExpense,
                'thr_expense' => $dailyThrExpense,
                'employee_count' => $employeeCount,
            ];
        })->values();
        
        // Calculate previous period comparison
        $dateRange = Carbon::parse($endDate)->diffInDays(Carbon::parse($startDate)) + 1;
        $previousStartDate = Carbon::parse($startDate)->subDays($dateRange)->format('Y-m-d');
        $previousEndDate = Carbon::parse($startDate)->subDay()->format('Y-m-d');
        
        $previousSalaries = Salary::with('instalmentPayment')
            ->whereBetween('salary_date', [$previousStartDate, $previousEndDate])
            ->get();
            
        $previousTotalExpense = $previousSalaries->sum('net_salary') + 
            $previousSalaries->sum(function($salary) {
                return $salary->instalmentPayment ? $salary->instalmentPayment->payment_value : 0;
            });
            
        $percentageChange = $previousTotalExpense > 0 
            ? (($totalExpense - $previousTotalExpense) / $previousTotalExpense) * 100 
            : 0;

        return inertia('Expense/Index', [
            'title' => "Total Pengeluaran",
            'description' => "Pengeluaran perusahaan dalam menggaji karyawan, angsuran dan THR",
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'summary' => [
                'total_expense' => $totalExpense,
                'total_salary_expense' => $totalSalaryExpense,
                'total_instalment_expense' => $totalInstalmentPayments,
                'total_thr_expense' => $totalThrExpense,
                'total_basic_salary' => $totalBasicSalary,
                'total_overtime_salary' => $totalOvertimeSalary,
                'total_deductions' => $totalSalaryDeductions,
                'employee_count' => $expenseByEmployee->count(),
                'salary_transactions' => $salaries->count(),
                'thr_transactions' => $thrBonuses->count(),
                'average_per_employee' => $expenseByEmployee->count() > 0 
                    ? $totalExpense / $expenseByEmployee->count() 
                    : 0,
                'previous_total' => $previousTotalExpense,
                'percentage_change' => round($percentageChange, 2),
            ],
            'expense_by_employee' => $expenseByEmployee,
            'expense_by_date' => $expenseByDate,
        ]);
    }
}
