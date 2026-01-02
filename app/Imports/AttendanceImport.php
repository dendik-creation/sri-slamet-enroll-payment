<?php

namespace App\Imports;

use App\Models\Attendance;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithStartRow;

class AttendanceImport implements ToCollection , WithHeadingRow, WithStartRow
{
    public function startRow(): int
    {
        return 5;
    }

    private function getEmployeeIdByNipByName($nip, $name, $employees)
    {
        $nip = trim((string) $nip);
        $name = trim((string) $name);

        if ($nip === '') {
            throw new \Exception('NIP kosong pada salah satu baris. Import dibatalkan');
        }

        if (!$employees || !($employees instanceof Collection)) {
            throw new \Exception('Peta karyawan (employees) tidak valid saat import.');
        }

        if (!$employees->has($nip)) {
            throw new \Exception("Karyawan dengan NIP {$nip} tidak ditemukan. Import dibatalkan");
        }

        $candidates = $employees->get($nip);

        if ($candidates->count() === 1) {
            $only = $candidates->first();
            return is_array($only) ? ($only['id'] ?? null) : $only->id;
        }

        $norm = function ($s) {
            $s = (string) $s;
            $s = preg_replace('/\s+/', ' ', trim($s));
            return strtolower($s);
        };

        $nameNorm = $norm($name);

        $exact = $candidates->filter(function ($emp) use ($norm, $nameNorm) {
            $empName = is_array($emp) ? ($emp['name'] ?? '') : ($emp->name ?? '');
            return $norm($empName) === $nameNorm;
        });
        if ($exact->count() === 1) {
            $emp = $exact->first();
            return is_array($emp) ? $emp['id'] : $emp->id;
        }

        $like1 = $candidates->filter(function ($emp) use ($norm, $nameNorm) {
            $empName = is_array($emp) ? ($emp['name'] ?? '') : ($emp->name ?? '');
            return $nameNorm !== '' && strpos($norm($empName), $nameNorm) !== false;
        });
        if ($like1->count() === 1) {
            $emp = $like1->first();
            return is_array($emp) ? $emp['id'] : $emp->id;
        }

        $like2 = $candidates->filter(function ($emp) use ($norm, $nameNorm) {
            $empName = is_array($emp) ? ($emp['name'] ?? '') : ($emp->name ?? '');
            $empNorm = $norm($empName);
            return $nameNorm !== '' && $empNorm !== '' && strpos($nameNorm, $empNorm) !== false;
        });
        if ($like2->count() === 1) {
            $emp = $like2->first();
            return is_array($emp) ? $emp['id'] : $emp->id;
        }

        $namesForNip = $candidates->map(function ($emp) {
            return is_array($emp) ? ($emp['name'] ?? '') : ($emp->name ?? '');
        })->filter()->unique()->values()->implode(', ');

        if ($like1->isEmpty() && $like2->isEmpty() && $exact->isEmpty()) {
            throw new \Exception("Tidak ditemukan kecocokan nama untuk NIP {$nip} dengan nama '{$name}'. Kandidat di sistem: {$namesForNip}");
        }

        throw new \Exception("Ditemukan lebih dari satu karyawan untuk NIP {$nip} yang cocok dengan nama '{$name}'. Kandidat: {$namesForNip}. Mohon pertegas nama di file Excel agar unik.");
    }

    public function collection(Collection $rows)
    {
        DB::transaction(function () use ($rows) {
            // 1 => NIP, 2 => NAMA, 4 => START, 5 => END, 6 => WORK_DAYS, 7 => OVERTIME
            $nips = $rows->pluck(1)->unique()->filter()->values();

            $employeeMap = Employee::whereIn('nip', $nips)
                ->get(['id', 'nip', 'name'])
                ->groupBy('nip');

            $missingNips = $nips->diff($employeeMap->keys());
            if ($missingNips->isNotEmpty()) {
                throw new \Exception('Ada NIP yang tidak ditemukan. Import dibatalkan');
            }

            $filteredRows = $rows->filter(function ($row) {
                return isset($row[1]) && !is_null($row[1]);
            });

            // Bangun kandidat terlebih dahulu (normalized)
            $candidates = [];
            $employeeIds = [];
            $startDates = [];
            $endDates = [];

            foreach ($filteredRows as $row) {
                $employee_id = $this->getEmployeeIdByNipByName($row[1], $row[2], $employeeMap);

                $period_start = null;
                $period_end = null;
                if (!empty($row[4])) {
                    $period_start = is_numeric($row[4])
                        ? \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($row[4])->format('Y-m-d')
                        : Carbon::parse($row[4])->format('Y-m-d');
                }
                if (!empty($row[5])) {
                    $period_end = is_numeric($row[5])
                        ? \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($row[5])->format('Y-m-d')
                        : Carbon::parse($row[5])->format('Y-m-d');
                }

                if (!$period_start || !$period_end) {
                    throw new \Exception('Tanggal awal/akhir wajib diisi untuk semua baris. Import dibatalkan');
                }

                $work_days = (float) ($row[6] ?? 0);
                $overtime = (float) ($row[7] ?? 0);

                $key = $employee_id . '|' . $period_start . '|' . $period_end;

                $candidates[] = [
                    'key'          => $key,
                    'employee_id'  => $employee_id,
                    'period_start' => $period_start,
                    'period_end'   => $period_end,
                    'work_days'    => $work_days,
                    'overtime'     => $overtime,
                    'is_used'      => false,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ];

                $employeeIds[] = $employee_id;
                $startDates[] = $period_start;
                $endDates[] = $period_end;
            }

            if (empty($candidates)) {
                return;
            }

            $employeeIds = array_values(array_unique($employeeIds));
            $minStart = min($startDates);
            $maxStart = max($startDates);
            $minEnd = min($endDates);
            $maxEnd = max($endDates);

            // Prefetch existing (is_used = false) within the min/max date bounds, then filter in PHP
            $existingKeys = Attendance::query()
                ->whereIn('employee_id', $employeeIds)
                ->where('is_used', false)
                ->whereBetween('period_start', [$minStart, $maxStart])
                ->whereBetween('period_end', [$minEnd, $maxEnd])
                ->get(['employee_id', 'period_start', 'period_end'])
                ->map(function ($a) {
                    return $a->employee_id . '|' . $a->period_start . '|' . $a->period_end;
                })
                ->all();
            $existingSet = array_flip($existingKeys);

            // Hindari duplikasi dalam file yang sama juga
            $seenInBatch = [];
            $toInsert = [];

            foreach ($candidates as $row) {
                $key = $row['key'];

                if (isset($existingSet[$key])) {
                    continue; // skip: sudah ada di DB (is_used = false) untuk periode & employee yang sama
                }
                if (isset($seenInBatch[$key])) {
                    continue; // skip: duplikat dalam file import
                }

                $seenInBatch[$key] = true;

                unset($row['key']);
                $toInsert[] = $row;
            }

            if (!empty($toInsert)) {
                Attendance::insert($toInsert);
            }
        });
    }
}
