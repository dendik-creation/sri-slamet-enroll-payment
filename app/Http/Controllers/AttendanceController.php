<?php

namespace App\Http\Controllers;

use App\Imports\AttendanceImport;
use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class AttendanceController extends Controller
{
    private function getWeekRange()
    {
        $today = \Carbon\Carbon::today();

        if ($today->isSaturday() || $today->isSunday()) {
            $today = $today->next(\Carbon\Carbon::MONDAY);
        }

        $monday = $today->copy()->startOfWeek(\Carbon\Carbon::MONDAY);
        $friday = $monday->copy()->addDays(4);
        $previousSaturday = $monday->copy()->subDays(2);

        return [
            'start_date' => $previousSaturday->format('Y-m-d'),
            'end_date' => $friday->format('Y-m-d'),
        ];
    }

    public function index(Request $request)
    {
        $search = $request->input('search');
        $period_start = $request->input('period_start') ?: $this->getWeekRange()['start_date'];
        $period_end = $request->input('period_end') ?: $this->getWeekRange()['end_date'];
        $employees = Employee::select('id', 'name', 'salary_type')
            ->orderBy('name')
            ->get()
            ->map(function ($emp) {
                return [
                    'value' => $emp->id,
                    'label' => $emp->name,
                    'other_info' => [
                        'salary_type' => $emp->salary_type,
                    ],
                ];
            });
        $employee_type = $request->input('employee_type') ?: null;
        $attendances = Attendance::with('employee')
            ->when($period_start && $period_end && $employee_type !== 'monthly', function ($query) use ($period_start, $period_end) {
                return $query->where(function ($q) use ($period_start, $period_end) {
                    $q->whereDate('period_start', '>=', $period_start)->whereDate('period_end', '<=', $period_end);
                });
            })
            ->when($search, function ($query, $search) {
                $query->whereHas('employee', function ($q) use ($search) {
                    $q->where('nip', 'like', "%{$search}%")->orWhere('name', 'like', "%{$search}%");
                });
            })
            ->when($employee_type, function ($query, $employee_type) {
                $query->whereHas('employee', function ($q) use ($employee_type) {
                    $q->where('salary_type', $employee_type);
                });
            })
            ->where('is_used', false)
            ->join('employees', 'attendances.employee_id', '=', 'employees.id')
            ->select('attendances.*')
            ->orderBy('employees.name')
            ->paginate(10);

        return Inertia::render('Attendance/Index', [
            'title' => 'Daftar Kehadiran',
            'filter' => [
                'period_start' => $period_start,
                'period_end' => $period_end,
                'search' => $search,
                'employee_type' => $employee_type,
            ],
            'description' => 'Daftar kehadiran karyawan (per periode) yang masih dapat diubah atau dihapus.',
            'attendances' => $attendances,
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'work_days' => 'required|numeric|min:0',
            'overtime' => 'nullable|numeric|min:0',
        ]);

        $existing_attendance = Attendance::where('employee_id', $request->employee_id)
            ->where('is_used', false)
            ->whereDate('period_start', date_format(date_create($request->period_start), 'Y-m-d'))
            ->whereDate('period_end', date_format(date_create($request->period_end), 'Y-m-d'))
            ->exists();

        if ($existing_attendance) {
            Session::flash('error', 'Data kehadiran untuk karyawan ini pada periode tersebut sudah ada');
            return Inertia::location('/attendance');
        }

        Attendance::create([
            'employee_id' => $request->employee_id,
            'period_start' => date_format(date_create($request->period_start), 'Y-m-d'),
            'period_end' => date_format(date_create($request->period_end), 'Y-m-d'),
            'work_days' => $request->work_days,
            'overtime' => $request->overtime ?: 0,
            'is_used' => false,
        ]);

        Session::flash('success', 'Data kehadiran berhasil ditambahkan');
        return Inertia::location('/attendance');
    }

    public function update(Request $request, $id)
    {
        $attendance = Attendance::findOrFail($id);
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'work_days' => 'required|numeric|min:0',
            'overtime' => 'nullable|numeric|min:0',
        ]);

        if ($attendance->is_used) {
            Session::flash('error', 'Data kehadiran ini sudah dikunci & tidak dapat diperbarui');
            return Inertia::location('/attendance');
        }

        $periodStart = date_format(date_create($request->period_start), 'Y-m-d');
        $periodEnd = date_format(date_create($request->period_end), 'Y-m-d');

        $exists = Attendance::where('employee_id', $request->employee_id)->where('is_used', false)->whereDate('period_start', $periodStart)->whereDate('period_end', $periodEnd)->where('id', '!=', $attendance->id)->exists();

        if ($exists) {
            Session::flash('error', 'Data kehadiran untuk karyawan ini pada periode tersebut sudah ada');
            return Inertia::location('/attendance');
        }

        $attendance->update([
            'employee_id' => $request->employee_id,
            'period_start' => date_format(date_create($request->period_start), 'Y-m-d'),
            'period_end' => date_format(date_create($request->period_end), 'Y-m-d'),
            'work_days' => $request->work_days,
            'overtime' => $request->overtime ?: 0,
        ]);

        Session::flash('success', 'Data kehadiran berhasil diperbarui');
        return Inertia::location('/attendance');
    }

    public function destroy($id)
    {
        $attendance = Attendance::findOrFail($id);
        if ($attendance->is_used) {
            Session::flash('error', 'Data kehadiran ini sudah dikunci & tidak dapat dihapus');
            return Inertia::location('/attendance');
        }
        $attendance->delete();
        Session::flash('success', 'Data kehadiran berhasil dihapus');
        return Inertia::location('/attendance');
    }

    public function import(Request $request)
    {
        $request->validate([
            'xlsx_file' => 'required|file|mimes:xlsx,xls',
        ]);

        $file = $request->file('xlsx_file');
        try {
            Excel::import(new AttendanceImport(), $file);
            Session::flash('success', 'Data absensi berhasil diimpor');
        } catch (\Exception $e) {
            Session::flash('error', $e->getMessage());
        }
        return Inertia::location('/attendance');
    }
}
