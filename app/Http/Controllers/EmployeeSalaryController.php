<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Salary;
use App\Models\SalaryDeduction;
use App\Models\EmployeeDeduction;
use App\Models\Instalment;
use App\Models\InstalmentPayment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class EmployeeSalaryController extends Controller
{
    private function latestStepInstalment($instalmentId)
    {
        return InstalmentPayment::where(
            "instalment_id",
            $instalmentId,
        )->count();
    }

    private function getWeekRange()
    {
        $today = \Carbon\Carbon::today();

        $monday = $today->copy()->startOfWeek(\Carbon\Carbon::MONDAY);
        $friday = $monday->copy()->addDays(4);
        $previousSaturday = $monday->copy()->subDays(2);

        return [
            "start_date" => $previousSaturday->format("Y-m-d"),
            "end_date" => $friday->format("Y-m-d"),
        ];
    }

    private function convertRoundSalary($salary)
    {
        $salaryInt = (int) round($salary);
        $tens = $salaryInt % 100;
        $main = $salaryInt - $tens;

        if ($tens < 50) {
            return $main;
        } else {
            return $main + 100;
        }
    }

    public function dailyView(Request $request)
    {
        $start_date = $request->input(
            "start_date",
            $this->getWeekRange()["start_date"],
        );
        $end_date = $request->input(
            "end_date",
            $this->getWeekRange()["end_date"],
        );

        $attendances = Attendance::whereHas("employee", function ($query) {
            $query->where("salary_type", Employee::EMPLOYEE_DAILY);
        })
            // overlap any part of the attendance period with requested range
            ->whereDate("period_start", ">=", $start_date)
            ->whereDate("period_end", "<=", $end_date)
            ->where("is_used", false)
            ->with("employee")
            ->orderBy(
                Employee::select("name")->whereColumn(
                    "employees.id",
                    "attendances.employee_id",
                ),
            )
            ->get();

        $deductions = SalaryDeduction::whereIn("target_employee", [
            Employee::EMPLOYEE_DAILY,
            "all",
            SalaryDeduction::TARGET_SPECIFIC,
        ])->get();
        $nowMonth = (int) now()->format("n");
        $nowYear = (int) now()->format("Y");

        // Group by employee_id and accumulate
        $grouped = $attendances->groupBy("employee_id");
        $salaryData = $grouped
            ->map(function ($items) use ($deductions, $nowMonth, $nowYear) {
                $employee = $items->first()->employee;
                $total_overtime_hours = (float) $items->sum("overtime");
                $total_work_days = (float) $items->sum("work_days");
                $basic_salary = $employee->salary_per_day * $total_work_days;
                $overtime_salary = $this->convertRoundSalary(
                    $this->calculateOvertimeSalary(
                        $employee->salary_per_day,
                        $total_overtime_hours,
                    ),
                );
                $pay_instalment = $this->payInstalment($employee->id);
                $instalment_status = $this->getInstalmentStatus($employee->id);

                // Compute deduction respecting monthly_once frequency
                $employeeTotalDeduction = 0;
                foreach ($deductions as $ded) {
                    // If deduction targets specific employees, ensure current employee is listed
                    if (
                        $ded->target_employee ===
                        SalaryDeduction::TARGET_SPECIFIC
                    ) {
                        $list = is_array($ded->specific_employee_id)
                            ? $ded->specific_employee_id
                            : [];
                        if (!in_array($employee->id, $list)) {
                            continue;
                        }
                    }
                    if ($ded->frequency === SalaryDeduction::FREQ_PER_PAYRUN) {
                        $employeeTotalDeduction += $ded->amount;
                    } else {
                        // monthly_once
                        $exists = EmployeeDeduction::forPeriod(
                            $employee->id,
                            $ded->id,
                            $nowMonth,
                            $nowYear,
                        )->exists();
                        if (!$exists) {
                            $employeeTotalDeduction += $ded->amount;
                        }
                    }
                }

                $net_salary =
                    $basic_salary +
                    $overtime_salary -
                    $employeeTotalDeduction -
                    $pay_instalment;

                return [
                    "employee_id" => $employee->id,
                    "employee" => $employee,
                    "total_work_days" => round($total_work_days, 2),
                    "total_overtime_hours" => round($total_overtime_hours, 2),
                    "basic_salary" => $basic_salary,
                    "overtime_salary" => $overtime_salary,
                    "total_deduction" => $this->convertRoundSalary(
                        $employeeTotalDeduction + $pay_instalment,
                    ),
                    "instalment_deduction" => $this->convertRoundSalary(
                        $pay_instalment,
                    ),
                    "instalment_status" => $instalment_status,
                    "net_salary" => $this->convertRoundSalary($net_salary),
                ];
            })
            ->values();

        $expected_employees = $salaryData
            ->map(function ($item) {
                return [
                    "value" => $item["employee_id"],
                    "label" => $item["employee"]["name"],
                ];
            })
            ->toArray();

        $perPage = 10;
        $page = (int) $request->input("page", 1);
        $paginated = $salaryData->forPage($page, $perPage)->values();
        $paginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $paginated,
            $salaryData->count(),
            $perPage,
            $page,
            ["path" => $request->url(), "query" => $request->query()],
        );

        return Inertia::render("Salary/Daily/Index", [
            "title" => "Gaji Harian Karyawan",
            "description" =>
                "Data berasal dari kalkulasi hari kerja. Data dibawah akan disimpan gaji ketika tombol simpan ditekan",
            "salaries" => $paginator,
            "start_date" => $start_date,
            "end_date" => $end_date,
            "expected_employees" => $expected_employees,
        ]);
    }

    public function monthlyView(Request $request)
    {
        $month = (int) $request->input("month", now()->format("n")); // ensure 1-12
        $year = $request->input("year", now()->year);
        $start_date = Carbon::create($year, $month, 1)
            ->startOfMonth()
            ->format("Y-m-d");
        $end_date = Carbon::create($year, $month, 1)
            ->endOfMonth()
            ->format("Y-m-d");
        $deductions = SalaryDeduction::whereIn("target_employee", [
            Employee::EMPLOYEE_MONTHLY,
            "all",
            SalaryDeduction::TARGET_SPECIFIC,
        ])->get();
        $attendances = Attendance::whereDate("period_start", ">=", $start_date)
            ->whereDate("period_end", "<=", $end_date)
            ->where("is_used", false)
            ->whereHas("employee", function ($query) {
                $query->where("salary_type", Employee::EMPLOYEE_MONTHLY);
            })
            ->with("employee")
            ->orderBy(
                Employee::select("name")->whereColumn(
                    "employees.id",
                    "attendances.employee_id",
                ),
            )
            ->get();

        $grouped = $attendances->groupBy("employee_id");
        $salaryData = $grouped
            ->map(function ($items) use ($deductions) {
                $employee = $items->first()->employee;
                $total_work_days = (float) $items->sum("work_days");
                $basic_salary = $employee->salary_per_month;
                $pay_instalment = $this->payInstalment($employee->id);
                $instalment_status = $this->getInstalmentStatus($employee->id);
                // Compute total deduction for this employee
                $employeeTotalDeduction = 0;
                foreach ($deductions as $ded) {
                    if (
                        $ded->target_employee ===
                        SalaryDeduction::TARGET_SPECIFIC
                    ) {
                        $list = is_array($ded->specific_employee_id)
                            ? $ded->specific_employee_id
                            : [];
                        if (!in_array($employee->id, $list)) {
                            continue;
                        }
                    }
                    $employeeTotalDeduction += $ded->amount;
                }
                // Mode Penguasa (kehadiran tidak berpengaruh pada gaji pokok)
                $net_salary =
                    $basic_salary - $employeeTotalDeduction - $pay_instalment;

                return [
                    "employee_id" => $employee->id,
                    "employee" => $employee,
                    "total_work_days" => round($total_work_days, 2),
                    "basic_salary" => $basic_salary,
                    "total_deduction" =>
                        $employeeTotalDeduction + $pay_instalment,
                    "instalment_deduction" => $pay_instalment,
                    "instalment_status" => $instalment_status,
                    "net_salary" => $net_salary,
                ];
            })
            ->values();

        $expected_employees = $salaryData
            ->map(function ($item) {
                return [
                    "value" => $item["employee_id"],
                    "label" => $item["employee"]["name"],
                ];
            })
            ->toArray();

        // Custom PaginatoR
        $perPage = 10;
        $page = (int) $request->input("page", 1);
        $paginated = $salaryData->forPage($page, $perPage)->values();
        $paginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $paginated,
            $salaryData->count(),
            $perPage,
            $page,
            ["path" => $request->url(), "query" => $request->query()],
        );

        return Inertia::render("Salary/Monthly/Index", [
            "title" => "Gaji Bulanan Karyawan",
            "description" =>
                "Data berasal dari kalkulasi hari kerja. Data dibawah akan disimpan gaji ketika tombol simpan ditekan",
            "salaries" => $paginator,
            "month" => $month,
            "year" => $year,
            "expected_employees" => $expected_employees,
        ]);
    }

    public function storeDailySalary(Request $request)
    {
        $with_print = $request->input("with_print", false);
        $start_date = $request->input(
            "start_date",
            $this->getWeekRange()["start_date"],
        );
        $end_date = $request->input(
            "end_date",
            $this->getWeekRange()["end_date"],
        );
        $salary_date = $request->input("salary_date", now()->format("Y-m-d"));
        $bonuses = $request->input("bonuses", []);

        // Eager load only necessary fields for performance
        $attendances = Attendance::with(["employee:id,salary_per_day"])
            ->whereHas("employee", function ($query) {
                $query->where("salary_type", Employee::EMPLOYEE_DAILY);
            })
            ->whereDate("period_start", ">=", $start_date)
            ->whereDate("period_end", "<=", $end_date)
            ->where("is_used", false)
            ->get([
                "id",
                "employee_id",
                "period_start",
                "period_end",
                "work_days",
                "overtime",
            ]);

        if ($attendances->isEmpty()) {
            Session::flash(
                "error",
                "Tidak ada data gaji harian untuk tanggal tersebut.",
            );
            return back();
        }

        // Pre-calculate deduction amounts (per payrun + monthly_once only if not yet applied this month for employee)
        $allDeductions = SalaryDeduction::whereIn("target_employee", [
            Employee::EMPLOYEE_DAILY,
            "all",
            SalaryDeduction::TARGET_SPECIFIC,
        ])->get();

        // Group attendances by employee_id and accumulate values
        $groupedAttendances = $attendances->groupBy("employee_id");
        $accumulatedSalaries = [];

        foreach ($groupedAttendances as $employeeId => $employeeAttendances) {
            $employee = $employeeAttendances->first()->employee;
            $total_work_days = (float) $employeeAttendances->sum("work_days");
            // Calculate basic salary (daily rate * total work days)
            $basicSalary = $employee->salary_per_day * $total_work_days;
            $totalOvertime = (float) $employeeAttendances->sum("overtime");
            $totalOvertimeSalary = $this->calculateOvertimeSalary(
                $employee->salary_per_day,
                $totalOvertime,
            );
            $totalBonus = $this->calculateEmployeeBonus($bonuses, $employeeId);
            $pay_instalment = $this->payInstalment($employeeId);

            $nowMonth = (int) now()->format("n");
            $nowYear = (int) now()->format("Y");
            $employeeTotalDeduction = 0;
            foreach ($allDeductions as $ded) {
                if (
                    $ded->target_employee === SalaryDeduction::TARGET_SPECIFIC
                ) {
                    $list = is_array($ded->specific_employee_id)
                        ? $ded->specific_employee_id
                        : [];
                    if (!in_array($employeeId, $list)) {
                        continue;
                    }
                }
                if ($ded->frequency === SalaryDeduction::FREQ_PER_PAYRUN) {
                    $employeeTotalDeduction += $ded->amount;
                } else {
                    // monthly_once
                    $exists = EmployeeDeduction::forPeriod(
                        $employeeId,
                        $ded->id,
                        $nowMonth,
                        $nowYear,
                    )->exists();
                    if (!$exists) {
                        $employeeTotalDeduction += $ded->amount; // first weekly payroll this month
                    }
                }
            }
            $netSalary =
                $basicSalary +
                $totalOvertimeSalary +
                $totalBonus -
                $employeeTotalDeduction -
                $pay_instalment;

            $accumulatedSalaries[] = [
                "employee_id" => $employeeId,
                "employee" => $employee,
                "total_work_days" => $total_work_days,
                "total_overtime" => $totalOvertime,
                "basic_salary" => $this->convertRoundSalary($basicSalary),
                "overtime_salary" => $this->convertRoundSalary(
                    $totalOvertimeSalary,
                ),
                "total_bonus" => $this->convertRoundSalary($totalBonus),
                "instalment_payment" => $this->convertRoundSalary(
                    $pay_instalment,
                ),
                "net_salary" => $this->convertRoundSalary($netSalary),
                "employee_total_deduction" => $employeeTotalDeduction,
                "period_starts" => $employeeAttendances
                    ->pluck("period_start")
                    ->toArray(),
                "period_ends" => $employeeAttendances
                    ->pluck("period_end")
                    ->toArray(),
            ];

            // Mark attendances as used
            Attendance::whereIn(
                "id",
                $employeeAttendances->pluck("id"),
            )->update(["is_used" => true]);
        }

        $now = now();
        $finalSalaries = [];

        foreach ($accumulatedSalaries as $salary) {
            // Determine final period range from min start and max end
            $periodStart = min($salary["period_starts"]);
            $periodEnd = max($salary["period_ends"]);
            $latestDate = $periodEnd;
            $finalSalaries[] = [
                "employee_id" => $salary["employee_id"],
                "salary_date" => $salary_date,
                "period_start" => $periodStart,
                "period_end" => $periodEnd,
                "month" => Carbon::parse($latestDate)->month,
                "year" => Carbon::parse($latestDate)->year,
                "total_work_days" => $salary["total_work_days"],
                "total_overtime_hours" => $salary["total_overtime"],
                "basic_salary" => $salary["basic_salary"],
                "overtime_salary" => $salary["overtime_salary"],
                "total_deduction" =>
                    $salary["employee_total_deduction"] +
                    $salary["instalment_payment"],
                "net_salary" => $salary["net_salary"],
                "created_at" => $now,
                "updated_at" => $now,
            ];
        }

        // Bulk insert in a single transaction
        if (!empty($finalSalaries)) {
            DB::transaction(function () use (
                $finalSalaries,
                $bonuses,
                $accumulatedSalaries,
            ) {
                DB::table("salaries")->insert($finalSalaries);

                // Store detailed deduction records
                $this->storeDeductionRecords($finalSalaries, "daily");
                if (!empty($bonuses)) {
                    $this->storeBonusRecords($bonuses, $finalSalaries);
                }
                $this->storeInstalmentPayments(
                    $finalSalaries,
                    $accumulatedSalaries,
                );
            });
        }

        if ($with_print) {
            Session::flash(
                "success",
                "Gaji harian berhasil disimpan dan siap dicetak.",
            );
            return Inertia::location(
                "/salary-daily/print?start_date=" .
                    $start_date .
                    "&end_date=" .
                    $end_date,
            );
        } else {
            Session::flash("success", "Gaji harian berhasil disimpan.");
            return Inertia::location("salary-daily");
        }
    }

    private function payInstalment($employee_id)
    {
        $instalment = \App\Models\Instalment::where("employee_id", $employee_id)
            ->where("remaining_amount", ">", 0)
            ->orderBy("taken_at", "asc")
            ->first();

        if (!$instalment) {
            return 0;
        }

        // Return the payment amount that should be deducted
        return min(
            $instalment->instalment_value,
            $instalment->remaining_amount,
        );
    }

    private function calculateOvertimeSalary($salaryPerDay, $overtimeHours)
    {
        if ($overtimeHours <= 0) {
            return 0;
        }

        $totalOvertimeSalary = 0;
        $remainingHours = $overtimeHours;
        $currentHour = 1;

        while ($remainingHours > 0) {
            if ($remainingHours >= 1) {
                // 1 jam
                $totalOvertimeSalary += $this->calculateHourlyOvertimeSalary(
                    $salaryPerDay,
                    1,
                    $currentHour,
                );
                $remainingHours -= 1;
                $currentHour++;
            } elseif ($remainingHours >= 0.5) {
                // 0.5 jam
                $totalOvertimeSalary += $this->calculateHourlyOvertimeSalary(
                    $salaryPerDay,
                    0.5,
                    $currentHour,
                );
                $remainingHours -= 0.5;
                $currentHour++;
            } else {
                // < 0.5 jam
                $totalOvertimeSalary += $this->calculateHourlyOvertimeSalary(
                    $salaryPerDay,
                    $remainingHours,
                    $currentHour,
                );
                $remainingHours = 0;
            }
        }

        return $totalOvertimeSalary;
    }

    private function calculateHourlyOvertimeSalary(
        $salaryPerDay,
        $hours,
        $hourNumber,
    ) {
        if ($hours == 0.5) {
            // 0.5 jam -> Gaji per Hari / 7 * 2 / 2
            return (($salaryPerDay / 7) * 2) / 2;
        } elseif ($hours == 1 && $hourNumber == 1) {
            // Jam ke-1 -> Gaji per Hari / 7 * 1.5
            return ($salaryPerDay / 7) * 1.5;
        } elseif ($hours == 1 && $hourNumber >= 2) {
            // Jam ke-2 dan seterusnya -> Gaji per Hari / 7 * 2 (flat)
            return ($salaryPerDay / 7) * 2;
        } else {
            // For other fractional hours
            if ($hourNumber == 1) {
                return ($salaryPerDay / 7) * $hours * 1.5;
            } else {
                return ($salaryPerDay / 7) * $hours * 2;
            }
        }
    }

    private function calculateEmployeeBonus($bonuses, $employeeId)
    {
        $totalBonus = 0;

        foreach ($bonuses as $bonus) {
            if (
                empty($bonus["bonus_type"]) ||
                !isset($bonus["amount"]) ||
                $bonus["amount"] <= 0
            ) {
                continue;
            }

            if ($bonus["target_employee"] === "all") {
                $totalBonus += $bonus["amount"];
            } elseif (
                $bonus["target_employee"] === "specific" &&
                isset($bonus["employee_id"]) &&
                in_array($employeeId, $bonus["employee_id"])
            ) {
                $totalBonus += $bonus["amount"];
            }
        }

        return $totalBonus;
    }

    private function storeBonusRecords($bonuses, $finalSalaries)
    {
        $now = now();
        $salaryDate = $now->format("Y-m-d");
        $bonusRecords = [];

        $salaryIds = [];
        foreach ($finalSalaries as $salary) {
            $salaryRecord = \App\Models\Salary::where(
                "employee_id",
                $salary["employee_id"],
            )
                ->where("salary_date", $salaryDate)
                ->latest("id")
                ->first();
            if ($salaryRecord) {
                $salaryIds[$salary["employee_id"]] = $salaryRecord->id;
            }
        }

        foreach ($bonuses as $bonus) {
            if (
                empty($bonus["bonus_type"]) ||
                !isset($bonus["amount"]) ||
                $bonus["amount"] <= 0
            ) {
                continue;
            }

            if ($bonus["target_employee"] === "all") {
                foreach ($salaryIds as $employeeId => $salaryId) {
                    $bonusRecords[] = [
                        "salary_id" => $salaryId,
                        "bonus_type" => $bonus["bonus_type"],
                        "amount" => $bonus["amount"],
                        "created_at" => $now,
                        "updated_at" => $now,
                    ];
                }
            } elseif (
                $bonus["target_employee"] === "specific" &&
                isset($bonus["employee_id"])
            ) {
                foreach ($bonus["employee_id"] as $employeeId) {
                    if (isset($salaryIds[$employeeId])) {
                        $bonusRecords[] = [
                            "salary_id" => $salaryIds[$employeeId],
                            "bonus_type" => $bonus["bonus_type"],
                            "amount" => $bonus["amount"],
                            "created_at" => $now,
                            "updated_at" => $now,
                        ];
                    }
                }
            }
        }

        if (!empty($bonusRecords)) {
            DB::table("salary_bonuses")->insert($bonusRecords);
        }
    }

    private function storeDeductionRecords(
        $finalSalaries,
        $employeeType = "daily",
    ) {
        $now = now();
        $salaryDate = $now->format("Y-m-d");
        $deductionRecords = [];

        // Get all deductions that apply to specified employee type
        $targetEmployee = $employeeType === "monthly" ? "monthly" : "daily";
        $deductions = \App\Models\SalaryDeduction::whereIn("target_employee", [
            $targetEmployee,
            "all",
            \App\Models\SalaryDeduction::TARGET_SPECIFIC,
        ])->get();

        $salaryIds = [];
        foreach ($finalSalaries as $salary) {
            $salaryRecord = \App\Models\Salary::where(
                "employee_id",
                $salary["employee_id"],
            )
                ->where("salary_date", $salaryDate)
                ->latest("id")
                ->first();
            if ($salaryRecord) {
                $salaryIds[$salary["employee_id"]] = $salaryRecord->id;
            }
        }

        $currentMonth = (int) $now->format("n");
        $currentYear = (int) $now->format("Y");

        foreach ($deductions as $deduction) {
            foreach ($salaryIds as $employeeId => $salaryIdVal) {
                // Apply only to specific employees when configured
                if (
                    $deduction->target_employee ===
                    \App\Models\SalaryDeduction::TARGET_SPECIFIC
                ) {
                    $list = is_array($deduction->specific_employee_id)
                        ? $deduction->specific_employee_id
                        : [];
                    if (!in_array($employeeId, $list)) {
                        continue;
                    }
                }
                // For monthly_once frequency: skip if already exists this month
                if (
                    $deduction->frequency ===
                    \App\Models\SalaryDeduction::FREQ_MONTHLY_ONCE
                ) {
                    $exists = \App\Models\EmployeeDeduction::forPeriod(
                        $employeeId,
                        $deduction->id,
                        $currentMonth,
                        $currentYear,
                    )->exists();
                    if ($exists) {
                        continue; // already deducted earlier this month
                    }
                }
                $deductionRecords[] = [
                    "salary_id" => $salaryIdVal,
                    "deduction_id" => $deduction->id,
                    "employee_id" => $employeeId,
                    "amount" => $deduction->amount,
                    "month" => $currentMonth,
                    "year" => $currentYear,
                    "created_at" => $now,
                    "updated_at" => $now,
                ];
            }
        }

        if (!empty($deductionRecords)) {
            DB::table("employee_deductions")->insert($deductionRecords);
        }
    }

    private function storeInstalmentPayments(
        $finalSalaries,
        $accumulatedSalaries,
    ) {
        $now = now();
        $salaryDate = $now->format("Y-m-d");
        $instalmentRecords = [];

        $salaryIds = [];
        foreach ($finalSalaries as $salary) {
            $salaryRecord = \App\Models\Salary::where(
                "employee_id",
                $salary["employee_id"],
            )
                ->where("salary_date", $salaryDate)
                ->latest("id")
                ->first();
            if ($salaryRecord) {
                $salaryIds[$salary["employee_id"]] = $salaryRecord->id;
            }
        }

        // Create a lookup for instalment amounts from accumulated salaries
        $instalmentAmounts = [];
        foreach ($accumulatedSalaries as $salary) {
            $instalmentAmounts[$salary["employee_id"]] =
                $salary["instalment_payment"] ?? 0;
        }

        foreach ($finalSalaries as $salary) {
            $employeeId = $salary["employee_id"];
            $instalmentAmount = $instalmentAmounts[$employeeId] ?? 0;

            if ($instalmentAmount > 0 && isset($salaryIds[$employeeId])) {
                // Get the active instalment
                $instalment = \App\Models\Instalment::where(
                    "employee_id",
                    $employeeId,
                )
                    ->where("remaining_amount", ">", 0)
                    ->orderBy("taken_at", "asc")
                    ->first();

                if ($instalment) {
                    $instalmentRecords[] = [
                        "instalment_id" => $instalment->id,
                        "salary_id" => $salaryIds[$employeeId],
                        "payment_value" => $instalmentAmount,
                        "paid_at" => $salaryDate,
                        "step" =>
                            $this->latestStepInstalment($instalment->id) + 1,
                        "created_at" => $now,
                        "updated_at" => $now,
                    ];

                    // Update remaining amount
                    $instalment->remaining_amount -= $instalmentAmount;
                    $instalment->save();
                }
            }
        }

        if (!empty($instalmentRecords)) {
            DB::table("instalment_payments")->insert($instalmentRecords);
        }
    }

    private function getInstalmentStatus($employee_id)
    {
        $instalment = \App\Models\Instalment::where("employee_id", $employee_id)
            ->where("remaining_amount", ">", 0)
            ->orderBy("taken_at", "asc")
            ->first();

        if (!$instalment) {
            return [
                "has_instalment" => false,
                "message" => "No active instalment found",
            ];
        }

        return [
            "has_instalment" => true,
            "instalment_id" => $instalment->id,
            "total_amount" => $instalment->total_amount,
            "instalment_value" => $instalment->instalment_value,
            "remaining_amount" => $instalment->remaining_amount,
            "payment_amount" => min(
                $instalment->instalment_value,
                $instalment->remaining_amount,
            ),
            "taken_at" => $instalment->taken_at,
        ];
    }

    public function storeMonthlySalary(Request $request)
    {
        $month = (int) $request->input("month", now()->format("n")); // ensure 1-12
        $year = $request->input("year", now()->year);
        $start_date = Carbon::create($year, $month, 1)
            ->startOfMonth()
            ->format("Y-m-d");
        $end_date = Carbon::create($year, $month, 1)
            ->endOfMonth()
            ->format("Y-m-d");
        $salary_date = $request->input("salary_date", now()->format("Y-m-d"));
        $with_print = $request->input("with_print", false);
        $bonuses = $request->input("bonuses", []);
        $now = now();
        $attendances = Attendance::whereDate("period_start", ">=", $start_date)
            ->whereDate("period_end", "<=", $end_date)
            ->whereHas("employee", function ($query) {
                $query->where("salary_type", Employee::EMPLOYEE_MONTHLY);
            })
            ->where("is_used", false)
            ->with(["employee:id,salary_per_day,salary_per_month"])
            ->get([
                "id",
                "employee_id",
                "period_start",
                "period_end",
                "work_days",
                "overtime",
            ]);

        if ($attendances->isEmpty()) {
            Session::flash(
                "error",
                "Tidak ada data gaji bulanan untuk bulan tersebut.",
            );
            return back();
        }
        // Deductions: per_payrun always, monthly_once always applied here because monthly salary runs once
        $allDeductions = SalaryDeduction::whereIn("target_employee", [
            Employee::EMPLOYEE_MONTHLY,
            "all",
            SalaryDeduction::TARGET_SPECIFIC,
        ])->get();
        $groupedAttendances = $attendances->groupBy("employee_id");
        $accumulatedSalaries = [];

        foreach ($groupedAttendances as $employeeId => $employeeAttendances) {
            $employee = $employeeAttendances->first()->employee;
            $total_work_days = (float) $employeeAttendances->sum("work_days");
            // Karyawan bulanan masuk tidak masuk tetap gaji full;
            // $basic_salary = $employee->salary_per_month - ($diff_day * $employee->salary_per_day);
            $basic_salary = $employee->salary_per_month;
            $totalBonus = $this->calculateEmployeeBonus($bonuses, $employeeId);
            $pay_instalment = $this->payInstalment($employeeId);
            $employeeTotalDeduction = 0;
            foreach ($allDeductions as $ded) {
                if (
                    $ded->target_employee === SalaryDeduction::TARGET_SPECIFIC
                ) {
                    $list = is_array($ded->specific_employee_id)
                        ? $ded->specific_employee_id
                        : [];
                    if (!in_array($employeeId, $list)) {
                        continue;
                    }
                }
                $employeeTotalDeduction += $ded->amount;
            }
            $netSalary =
                $basic_salary +
                $totalBonus -
                $employeeTotalDeduction -
                $pay_instalment;

            $accumulatedSalaries[] = [
                "employee_id" => $employeeId,
                "employee" => $employee,
                "total_work_days" => $total_work_days,
                "basic_salary" => $this->convertRoundSalary($basic_salary),
                "total_bonus" => $this->convertRoundSalary($totalBonus),
                "instalment_payment" => $this->convertRoundSalary(
                    $pay_instalment,
                ),
                "net_salary" => $this->convertRoundSalary($netSalary),
                "employee_total_deduction" => $employeeTotalDeduction,
                "period_starts" => $employeeAttendances
                    ->pluck("period_start")
                    ->toArray(),
                "period_ends" => $employeeAttendances
                    ->pluck("period_end")
                    ->toArray(),
            ];
            Attendance::whereIn(
                "id",
                $employeeAttendances->pluck("id"),
            )->update(["is_used" => true]);
        }

        $finalSalaries = [];
        foreach ($accumulatedSalaries as $salary) {
            $start_date = min($salary["period_starts"]);
            $end_date = max($salary["period_ends"]);

            $finalSalaries[] = [
                "employee_id" => $salary["employee_id"],
                "salary_date" => $salary_date,
                "period_start" => $start_date,
                "period_end" => $end_date,
                "month" => $start_date
                    ? Carbon::parse($start_date)->month
                    : $now->month,
                "year" => $start_date
                    ? Carbon::parse($start_date)->year
                    : $now->year,
                "total_work_days" => $salary["total_work_days"],
                "total_overtime_hours" => 0, // monthly not have overtime
                "basic_salary" => $salary["basic_salary"],
                "overtime_salary" => 0, // monthly not have overtime
                "total_deduction" =>
                    $salary["employee_total_deduction"] +
                    $this->payInstalment($salary["employee_id"]),
                "net_salary" => $salary["net_salary"],
                "created_at" => $now,
                "updated_at" => $now,
            ];
        }

        // Bulk insert in a single transaction
        if (!empty($finalSalaries)) {
            DB::transaction(function () use (
                $finalSalaries,
                $bonuses,
                $accumulatedSalaries,
            ) {
                DB::table("salaries")->insert($finalSalaries);
                $this->storeDeductionRecords($finalSalaries, "monthly");
                if (!empty($bonuses)) {
                    $this->storeBonusRecords($bonuses, $finalSalaries);
                }
                $this->storeInstalmentPayments(
                    $finalSalaries,
                    $accumulatedSalaries,
                );
            });
        }

        if ($with_print) {
            Session::flash(
                "success",
                "Gaji bulanan berhasil disimpan dan siap dicetak.",
            );
            return Inertia::location(
                "/salary-monthly/print?month=" . $month . "&year=" . $year,
            );
        } else {
            Session::flash("success", "Gaji bulanan berhasil disimpan.");
            return Inertia::location("salary-monthly");
        }
    }

    public function printDailySalaryReport(Request $request)
    {
        $start_date = $request->input(
            "start_date",
            $this->getWeekRange()["start_date"],
        );
        $end_date = $request->input(
            "end_date",
            $this->getWeekRange()["end_date"],
        );
        $salaries = Salary::with(
            "employee",
            "bonuses",
            "instalmentPayment",
            "deductions",
        )
            ->whereHas("employee", function ($query) {
                $query->where("salary_type", Employee::EMPLOYEE_DAILY);
            })
            ->whereDate("period_start", ">=", $start_date)
            ->whereDate("period_end", "<=", $end_date)
            ->orderBy(
                Employee::select("name")->whereColumn(
                    "employees.id",
                    "salaries.employee_id",
                ),
            )
            ->get();
        $total_remaining_instalment = Instalment::where(
            "remaining_amount",
            ">",
            0,
        )
            ->whereHas("employee", function ($query) {
                $query->where("salary_type", Employee::EMPLOYEE_DAILY);
            })
            ->whereHas("payments", function ($query) use (
                $start_date,
                $end_date,
            ) {
                $query
                    ->whereBetween("paid_at", [$start_date, $end_date])
                    ->where("payment_source", InstalmentPayment::SALARY_SOURCE);
            })
            ->with([
                "payments" => function ($query) use ($start_date, $end_date) {
                    $query
                        ->whereBetween("paid_at", [$start_date, $end_date])
                        ->where(
                            "payment_source",
                            InstalmentPayment::SALARY_SOURCE,
                        );
                },
            ])
            ->get()
            ->sum(function ($instalment) {
                return $instalment->payments->sum("payment_value");
            });
        return Inertia::render("Salary/Daily/Print", [
            "title" => "Laporan Gaji Harian",
            "description" => "CV Sri Slamet",
            "salaries" => $salaries,
            "start_date" => $start_date,
            "end_date" => $end_date,
            "total_remaining_instalment" => $total_remaining_instalment,
        ]);
    }

    public function printMonthlySalaryReport(Request $request)
    {
        $month = (int) $request->input("month", now()->format("n")); // ensure 1-12
        $year = $request->input("year", now()->year);
        $start_date = Carbon::create($year, $month, 1)
            ->startOfMonth()
            ->format("Y-m-d");
        $end_date = Carbon::create($year, $month, 1)
            ->endOfMonth()
            ->format("Y-m-d");

        $salaries = Salary::with("employee", "bonuses")
            ->whereHas("employee", function ($query) {
                $query->where("salary_type", Employee::EMPLOYEE_MONTHLY);
            })
            ->where("period_start", ">=", $start_date)
            ->where("period_end", "<=", $end_date)
            ->orderBy(
                Employee::select("name")->whereColumn(
                    "employees.id",
                    "salaries.employee_id",
                ),
            )
            ->get();
        $total_remaining_instalment = Instalment::where(
            "remaining_amount",
            ">",
            0,
        )
            ->whereHas("employee", function ($query) {
                $query->where("salary_type", Employee::EMPLOYEE_MONTHLY);
            })
            ->whereHas("payments", function ($query) use (
                $start_date,
                $end_date,
            ) {
                $query
                    ->whereBetween("paid_at", [$start_date, $end_date])
                    ->where("payment_source", InstalmentPayment::SALARY_SOURCE);
            })
            ->with([
                "payments" => function ($query) use ($start_date, $end_date) {
                    $query
                        ->whereBetween("paid_at", [$start_date, $end_date])
                        ->where(
                            "payment_source",
                            InstalmentPayment::SALARY_SOURCE,
                        );
                },
            ])
            ->get()
            ->sum(function ($instalment) {
                return $instalment->payments->sum("payment_value");
            });

        return Inertia::render("Salary/Monthly/Print", [
            "title" => "Laporan Gaji Bulanan",
            "description" => "CV Sri Slamet",
            "salaries" => $salaries,
            "month" => $month,
            "year" => $year,
            "total_remaining_instalment" => $total_remaining_instalment,
        ]);
    }

    public function slipView(Request $request)
    {
        $start_date = $request->input(
            "start_date",
            $this->getWeekRange()["start_date"],
        );
        $end_date = $request->input(
            "end_date",
            $this->getWeekRange()["end_date"],
        );
        $employee_id = $request->input("employee_id") ?: null;
        $employee_type = $request->input("employee_type") ?: null;
        $employees = Employee::orderBy("name")
            ->get()
            ->map(function ($employee) {
                return [
                    "value" => $employee->id,
                    "label" => $employee->name,
                ];
            });
        $salaries = Salary::with([
            "employee",
            "bonuses",
            "deductions.deduction",
            "instalmentPayment.instalment",
        ])
            ->when($employee_id, function ($query) use ($employee_id) {
                return $query->where("employee_id", $employee_id);
            })
            ->when($employee_type, function ($query) use ($employee_type) {
                return $query->whereHas("employee", function ($q) use (
                    $employee_type,
                ) {
                    $q->where("salary_type", $employee_type);
                });
            })
            ->whereDate("period_start", ">=", $start_date)
            ->whereDate("period_end", "<=", $end_date)
            ->orderBy(
                Employee::select("name")->whereColumn(
                    "employees.id",
                    "salaries.employee_id",
                ),
            )
            ->paginate(10)
            ->appends($request->query());

        return Inertia::render("Salary/Slip/Index", [
            "title" => "Slip Gaji Karyawan",
            "description" => "Data gaji karyawan yang telah disimpan",
            "employees" => $employees,
            "salaries" => $salaries,
            "employee_id" => $employee_id,
            "start_date" => $start_date,
            "end_date" => $end_date,
            "employee_type" => $employee_type,
        ]);
    }

    public function slipShow($salary_id)
    {
        $salary = Salary::with([
            "employee.position",
            "bonuses",
            "deductions.deduction",
            "instalmentPayment.instalment",
        ])->findOrFail($salary_id);
        $deductions = [];
        $bonuses = [];

        $salary->deductions->each(function ($deduction) use (&$deductions) {
            $deductions[] = [
                "name" => $deduction->deduction->name,
                "amount" => $deduction->amount,
            ];
        });

        if ($salary->instalmentPayment) {
            $deductions[] = [
                "name" =>
                    "Pembayaran angsuran ke-" .
                    $salary->instalmentPayment
                        ->where(
                            "instalment_id",
                            $salary->instalmentPayment->instalment->id,
                        )
                        ->count(),
                "amount" => $salary->instalmentPayment->payment_value,
            ];
        }

        $salary->bonuses->each(function ($bonus) use (&$bonuses) {
            $bonuses[] = [
                "name" => $bonus->bonus_type,
                "amount" => $bonus->amount,
            ];
        });

        return Inertia::render("Salary/Slip/Show", [
            "title" => "Detail Slip Gaji Karyawan",
            "description" => "Detail gaji karyawan yang telah disimpan",
            "salary" => $salary,
            "deductions" => $deductions,
            "bonuses" => $bonuses,
        ]);
    }

    public function printSalarySlipAll(Request $request)
    {
        $start_date = $request->input("start_date") ?: null;
        $end_date = $request->input("end_date") ?: null;
        $employee_id = $request->input("employee_id") ?: null;
        $employee_type = $request->input("employee_type") ?: null;

        $salaries = Salary::with([
            "employee.position",
            "bonuses",
            "deductions.deduction",
            "instalmentPayment",
        ])
            ->when($employee_id, function ($query) use ($employee_id) {
                return $query->where("employee_id", $employee_id);
            })
            ->when($employee_type, function ($query) use ($employee_type) {
                return $query->whereHas("employee", function ($q) use (
                    $employee_type,
                ) {
                    $q->where("salary_type", $employee_type);
                });
            })
            ->when($start_date && $end_date, function ($query) use (
                $start_date,
                $end_date,
            ) {
                return $query
                    ->whereDate("period_start", "<=", $end_date)
                    ->whereDate("period_end", ">=", $start_date);
            })
            ->get();

        // Sort salaries based on employee type and specific criteria
        $salaries = $salaries
            ->sort(function ($a, $b) {
                // Get NIP suffix (last 2 characters) for daily employees
                $getNipSuffix = function ($nip) {
                    return substr($nip, -2);
                };

                // Define NIP suffix priority order: BP, KO, OT
                $nipPriority = ["BP" => 1, "KO" => 2, "OT" => 3];

                // First, separate by salary type
                if ($a->employee->salary_type !== $b->employee->salary_type) {
                    // Daily employees come first, then monthly
                    return $a->employee->salary_type === "daily" ? -1 : 1;
                }

                // For daily employees: sort by NIP suffix priority first, then by name
                if ($a->employee->salary_type === "daily") {
                    $suffixA = $getNipSuffix($a->employee->nip);
                    $suffixB = $getNipSuffix($b->employee->nip);

                    $priorityA = $nipPriority[$suffixA] ?? 999; // Unknown suffixes go last
                    $priorityB = $nipPriority[$suffixB] ?? 999;

                    // If NIP suffix priority is different, sort by priority
                    if ($priorityA !== $priorityB) {
                        return $priorityA - $priorityB;
                    }

                    // If same NIP suffix priority, sort by name
                    return strcmp($a->employee->name, $b->employee->name);
                }

                // For monthly employees: sort by name only
                return strcmp($a->employee->name, $b->employee->name);
            })
            ->values();

        return Inertia::render("Salary/Slip/PrintAll", [
            "title" => "Cetak Slip Gaji Karyawan",
            "description" => "CV Sri Slamet",
            "salaries" => $salaries,
            "employee_id" => $employee_id,
        ]);
    }

    public function slipEdit($salary_id)
    {
        $salary = Salary::with([
            "employee.position",
            "bonuses",
            "deductions.deduction",
            "instalmentPayment.instalment",
        ])->findOrFail($salary_id);
        $deductions_list = SalaryDeduction::all()
            ->filter(function ($deduction) use ($salary) {
                // Jika target_employee spesific, cek apakah employee_id ada di specific_employee_id
                if (
                    $deduction->target_employee ===
                    SalaryDeduction::TARGET_SPECIFIC
                ) {
                    $specific_ids = [];
                    if ($deduction->specific_employee_id) {
                        if (is_string($deduction->specific_employee_id)) {
                            $decoded = json_decode(
                                $deduction->specific_employee_id,
                                true,
                            );
                            $specific_ids = is_array($decoded) ? $decoded : [];
                        } elseif (is_array($deduction->specific_employee_id)) {
                            $specific_ids = $deduction->specific_employee_id;
                        }
                    }
                    return in_array($salary->employee->id, $specific_ids);
                }
                // Jika target_employee 'daily' atau 'monthly', cek apakah employee salary_type sesuai
                if (
                    $deduction->target_employee === SalaryDeduction::TARGET_ALL
                ) {
                    return true;
                }
                return $salary->employee->salary_type ===
                    $deduction->target_employee;
            })
            ->map(function ($deduction) {
                $specific_ids = [];
                if ($deduction->specific_employee_id) {
                    if (is_string($deduction->specific_employee_id)) {
                        $decoded = json_decode(
                            $deduction->specific_employee_id,
                            true,
                        );
                        $specific_ids = is_array($decoded) ? $decoded : [];
                    } elseif (is_array($deduction->specific_employee_id)) {
                        $specific_ids = $deduction->specific_employee_id;
                    }
                }
                $employee_list_in_name = !empty($specific_ids)
                    ? Employee::whereIn("id", $specific_ids)
                        ->pluck("name")
                        ->toArray()
                    : [];
                return [
                    "label" =>
                        $deduction->name .
                        ($deduction->target_employee ===
                        SalaryDeduction::TARGET_SPECIFIC
                            ? " (" . implode(", ", $employee_list_in_name) . ")"
                            : ""),
                    "value" => $deduction->id,
                    "other_info" => [
                        "amount" => $deduction->amount,
                    ],
                ];
            })
            ->values();

        return Inertia::render("Salary/Slip/Edit", [
            "title" => "Edit Slip Gaji Karyawan",
            "description" => "Edit detail gaji karyawan",
            "salary" => $salary,
            "deductions_list" => $deductions_list,
        ]);
    }

    public function slipUpdate(Request $request, $salary_id)
    {
        $validatedData = $request->validate([
            "total_work_days" => "required|numeric|min:0",
            "total_overtime_hours" => "required|numeric|min:0",
            "basic_salary" => "required|numeric|min:0",
            "overtime_salary" => "required|numeric|min:0",
            // total_deduction will be recalculated from detailed deductions list
            "net_salary" => "required|numeric|min:0",
            "bonuses" => "nullable|array",
            "bonuses.*.bonus_type" => "nullable|string|max:255",
            "bonuses.*.amount" => "nullable|numeric|min:0",
            "deductions" => "nullable|array",
            "deductions.*.deduction_id" =>
                "required|integer|exists:salary_deductions,id",
        ]);

        DB::beginTransaction();

        try {
            $salary = Salary::findOrFail($salary_id);
            // Clean existing bonuses and deductions for this salary
            $salary->bonuses()->delete();
            $salary->deductions()->delete();

            $totalBonusAmount = 0;
            if (
                isset($validatedData["bonuses"]) &&
                is_array($validatedData["bonuses"])
            ) {
                foreach ($validatedData["bonuses"] as $bonusData) {
                    if (
                        !empty($bonusData["bonus_type"]) &&
                        isset($bonusData["amount"]) &&
                        $bonusData["amount"] >= 0
                    ) {
                        $salary->bonuses()->create([
                            "bonus_type" => $bonusData["bonus_type"],
                            "amount" => $bonusData["amount"],
                        ]);
                        $totalBonusAmount += $bonusData["amount"];
                    }
                }
            }
            // Recreate deductions and compute total deduction using canonical amounts
            $totalDeductionAmount = 0;
            if (
                isset($validatedData["deductions"]) &&
                is_array($validatedData["deductions"])
            ) {
                $seen = [];
                foreach ($validatedData["deductions"] as $dedData) {
                    $deductionId = (int) ($dedData["deduction_id"] ?? 0);
                    if ($deductionId <= 0 || isset($seen[$deductionId])) {
                        continue; // skip invalid or duplicate selections
                    }
                    $seen[$deductionId] = true;

                    $deduction = SalaryDeduction::find($deductionId);
                    if (!$deduction) {
                        continue;
                    }
                    $amount = (int) $deduction->amount;

                    // Create fresh records bound to this salary and period
                    \App\Models\EmployeeDeduction::create([
                        "salary_id" => $salary->id,
                        "deduction_id" => $deductionId,
                        "employee_id" => $salary->employee_id,
                        "amount" => $amount,
                        "month" => $salary->month,
                        "year" => $salary->year,
                    ]);
                    $totalDeductionAmount += $amount;
                }
            }

            $recalculatedNetSalary =
                $validatedData["basic_salary"] +
                $validatedData["overtime_salary"] +
                $totalBonusAmount -
                $totalDeductionAmount;

            $salary->update([
                "total_work_days" => $validatedData["total_work_days"],
                "total_overtime_hours" =>
                    $validatedData["total_overtime_hours"],
                "basic_salary" => $validatedData["basic_salary"],
                "overtime_salary" => $validatedData["overtime_salary"],
                "total_deduction" => $totalDeductionAmount,
                "net_salary" => $recalculatedNetSalary,
            ]);

            DB::commit();

            Session::flash("success", "Slip gaji berhasil diperbarui");
            return Inertia::location("/salary-slip/show/" . $salary_id);
        } catch (\Exception $e) {
            DB::rollback();
            Session::flash(
                "error",
                "Terjadi kesalahan saat memperbarui slip gaji: " .
                    $e->getMessage(),
            );
            return Inertia::location("/salary-slip/edit/" . $salary_id);
        }
    }

    public function printSalarySlipSpesific($salary_id)
    {
        $salary = Salary::with([
            "employee.position",
            "bonuses",
            "deductions.deduction",
            "instalmentPayment.instalment",
        ])->findOrFail($salary_id);
        return Inertia::render("Salary/Slip/PrintSpesific", [
            "title" => "Cetak Slip Gaji Karyawan",
            "description" => "CV Sri Slamet",
            "salary" => $salary,
        ]);
    }

    public function slipEnvelopeView()
    {
        $period_start = $this->getWeekRange()["start_date"];
        $period_end = $this->getWeekRange()["end_date"];
        $current_month = now()->format("n");
        return Inertia::render("Salary/SlipEnvelope/Index", [
            "title" => "Amplop Gaji Karyawan",
            "description" => "Cetak amplop gaji karyawan sekaligus",
            "period_start" => $period_start,
            "period_end" => $period_end,
            "current_month" => $current_month,
        ]);
    }

    private function convertMonthToId($month)
    {
        $months = [
            1 => "Januari",
            2 => "Februari",
            3 => "Maret",
            4 => "April",
            5 => "Mei",
            6 => "Juni",
            7 => "Juli",
            8 => "Agustus",
            9 => "September",
            10 => "Oktober",
            11 => "November",
            12 => "Desember",
        ];

        return $months[$month] ?? null;
    }

    public function printSalarySlipEnvelope(Request $request)
    {
        $validated = $request->validate([
            "period_start" => "nullable|date",
            "period_end" => "nullable|date|after_or_equal:period_start",
            "selected_month" => "nullable|integer|min:1|max:12",
            "employee_type" => "nullable|in:daily,monthly",
        ]);
        $period_start = $validated["period_start"];
        $period_end = $validated["period_end"];
        $selected_month = $validated["selected_month"] ?? now()->format("n");
        $employee_type = $validated["employee_type"] ?? null;

        $employees = Employee::when($employee_type, function ($query) use (
            $employee_type,
        ) {
            $salary_type =
                $employee_type === "daily"
                    ? Employee::EMPLOYEE_DAILY
                    : Employee::EMPLOYEE_MONTHLY;
            return $query->where("salary_type", $salary_type);
        })
            ->orderBy("name")
            ->get();
        $employees = $employees->map(function ($employee) use (
            $period_start,
            $period_end,
            $selected_month,
        ) {
            $data = [
                "id" => $employee->id,
                "name" => $employee->name,
                "nip" => $employee->nip,
                "salary_type" => $employee->salary_type,
            ];
            if ($employee->salary_type == Employee::EMPLOYEE_DAILY) {
                $data["period_start"] = $period_start;
                $data["period_end"] = $period_end;
            } else {
                $data["selected_month"] = $this->convertMonthToId(
                    $selected_month,
                );
                $data["selected_year"] = now()->format("Y");
            }
            return $data;
        });
        return Inertia::render("Salary/SlipEnvelope/Print", [
            "title" => "Cetak Amplop Slip Gaji Karyawan",
            "description" => "CV Sri Slamet",
            "employees" => $employees,
        ]);
    }

    public function slipDestroy($salary_id)
    {
        $salary = Salary::findOrFail($salary_id);
        DB::beginTransaction();
        try {
            $salary->bonuses()->delete();
            $salary->deductions()->delete();

            $instalmentPayment = $salary->instalmentPayment;
            if ($instalmentPayment) {
                Instalment::where("id", $instalmentPayment->instalment_id)->increment(
                    "remaining_amount",
                    $instalmentPayment->payment_value,
                );
                // Geser mundur step pembayaran-pembayaran setelahnya biar tetap berurutan
                InstalmentPayment::where(
                    "instalment_id",
                    $instalmentPayment->instalment_id,
                )
                    ->where("step", ">", $instalmentPayment->step)
                    ->decrement("step");
                $instalmentPayment->delete();
            }

            $salary->delete();

            DB::commit();
            Session::flash("success", "Data gaji berhasil dihapus.");
            return Inertia::location("/salary-slip");
        } catch (\Exception $e) {
            DB::rollback();
            Session::flash(
                "error",
                "Data gaji gagal dihapus: " . $e->getMessage(),
            );
            return Inertia::location("/salary-slip");
        }
    }
}
