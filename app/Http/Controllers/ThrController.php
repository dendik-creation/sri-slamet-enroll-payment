<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeThrBonus;
use App\Models\ThrBonus;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class ThrController extends Controller
{
    private function convertToRoundBonus($bonus)
    {
        $salaryInt = (int) round($bonus);
        $tens = $salaryInt % 100;
        $main = $salaryInt - $tens;

        if ($tens < 50) {
            return $main;
        } else {
            return $main + 100;
        }
    }

    public function index()
    {
        $thr_bonuses = ThrBonus::with("employee_thrs")->paginate(50);
        $is_thr_given = ThrBonus::where("year", date("Y"))->exists();
        return Inertia::render("ThrBonus/Index", [
            "title" => "THR Karyawan",
            "description" => "Daftar THR tahunan untuk karyawan",
            "thr_bonuses" => $thr_bonuses,
            "is_thr_given" => $is_thr_given,
        ]);
    }

    public function show($thr_bonus_id)
    {
        $thr_bonus = ThrBonus::with("employee_thrs.employee")->findOrFail(
            $thr_bonus_id,
        );
        return Inertia::render("ThrBonus/Show", [
            "title" => "Detail THR Karyawan Tahun {$thr_bonus->year}",
            "description" =>
                "Anda dapat melakukan cetak secara keseluruhan atau sebagian",
            "thr_bonus" => $thr_bonus,
        ]);
    }

    private function calculateTHRFormula(
        $salary_per_day,
        $salary_type,
        $join_date,
        $salary_per_month = 0,
    ) {
        if ($salary_type === "monthly") {
            return $salary_per_month;
        }

        $join_date = Carbon::parse($join_date)->startOfDay();
        $now = Carbon::now()->startOfDay();

        $total_days = $join_date->diffInDays($now) + 1;
        if ($total_days < 30) {
            return (30 * $salary_per_day) / 12;
        }

        $months_worked = $total_days / 30;

        if ($months_worked >= 12) {
            return 30 * $salary_per_day;
        } else {
            return ($months_worked * (30 * $salary_per_day)) / 12;
        }
    }

    private function calculateTHR()
    {
        $employees = Employee::get([
            "id",
            "salary_per_day",
            "salary_per_month",
            "salary_type",
            "join_date",
        ]);
        $thr_data = [];
        foreach ($employees as $employee) {
            $amount = $this->calculateTHRFormula(
                $employee["salary_per_day"],
                $employee["salary_type"],
                $employee["join_date"],
                $employee["salary_per_month"],
            );
            $thr_data[] = [
                "employee_id" => $employee["id"],
                "amount" => $this->convertToRoundBonus($amount),
                "created_at" => now(),
                "updated_at" => now(),
            ];
        }
        return $thr_data;
    }

    public function store(Request $request)
    {
        $request->validate([
            "year" => "required",
        ]);
        $year = $request->input("year", date("Y"));
        $thr_data = $this->calculateTHR();
        $accumulated_amount = array_sum(array_column($thr_data, "amount"));
        $thr_bonus = ThrBonus::create([
            "year" => $year,
            "paid_at" => now()->format("Y-m-d"),
            "total_amount" => $this->convertToRoundBonus($accumulated_amount),
        ]);
        foreach ($thr_data as &$data) {
            $data["thr_bonus_id"] = $thr_bonus->id;
        }
        $thr_bonus->employee_thrs()->createMany($thr_data);
        Session::flash("success", "THR berhasil dibuat untuk tahun " . $year);
        return Inertia::location("/thr");
    }

    public function destroy($id)
    {
        $thr_bonus = ThrBonus::findOrFail($id);
        $thr_bonus->employee_thrs()->delete();
        $thr_bonus->delete();
        Session::flash("success", "THR berhasil dihapus.");
        return Inertia::location("/thr");
    }

    public function printLegger($thr_bonus_id)
    {
        $thr_bonus = ThrBonus::with(
            "employee_thrs.employee.position",
        )->findOrFail($thr_bonus_id);
        return Inertia::render("ThrBonus/PrintLegger", [
            "title" => "Legger THR Karyawan Tahun {$thr_bonus->year}",
            "description" => "Legger THR karyawan untuk tahun {$thr_bonus->year}",
            "thr_bonus" => $thr_bonus,
            "company_name" => "CV Sri Slamet",
            "back_url" => "/thr/{$thr_bonus_id}",
        ]);
    }

    public function printAll($thr_bonus_id)
    {
        $thr_bonus = ThrBonus::with(
            "employee_thrs.employee.position",
        )->findOrFail($thr_bonus_id);
        return Inertia::render("ThrBonus/PrintAll", [
            "title" => "Cetak THR Karyawan Tahun {$thr_bonus->year}",
            "description" => "Cetak semua THR karyawan untuk tahun {$thr_bonus->year}",
            "thr_bonus" => $thr_bonus,
            "company_name" => "CV Sri Slamet",
            "back_url" => "/thr",
        ]);
    }

    public function printSpesific($thr_bonus_id, $employee_thr_id)
    {
        $employee_thr = EmployeeThrBonus::with(
            "employee.position",
            "thr_bonus",
        )->findOrFail($employee_thr_id);
        if (!$employee_thr) {
            abort(404, "Data THR karyawan tidak ditemukan.");
        }
        return Inertia::render("ThrBonus/PrintSpesific", [
            "title" => "Cetak THR Karyawan {$employee_thr->employee->name} Tahun {$employee_thr->thr_bonus->year}",
            "description" => "Cetak THR spesifik untuk karyawan {$employee_thr->employee->name}",
            "employee_thr" => $employee_thr,
            "company_name" => "CV Sri Slamet",
            "back_url" => "/thr/{$thr_bonus_id}",
        ]);
    }
}
