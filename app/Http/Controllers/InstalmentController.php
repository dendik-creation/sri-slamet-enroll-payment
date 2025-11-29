<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Instalment;
use App\Models\InstalmentPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InstalmentController extends Controller
{
    private function latestStepInstalment($instalmentId)
    {
        return InstalmentPayment::where('instalment_id', $instalmentId)->count();
    }

    public function index(Request $request)
    {
        $employee_search = $request->input('employee_search') ?: null;

        $instalments = Instalment::with('employee', 'payments')
            ->when($employee_search, function ($query) use ($employee_search) {
                return $query->whereHas('employee', function ($q) use ($employee_search) {
                    $q->where('name', 'like', '%' . $employee_search . '%')->orWhere('nip', 'like', '%' . $employee_search . '%');
                });
            })
            ->orderBy('taken_at', 'desc')
            ->paginate(10);

        return Inertia::render('Instalment/Index', [
            'title' => 'Angsuran Karyawan',
            'description' => 'Daftar angsuran karyawan dan rincian pembayaran didalamnya',
            'instalments' => $instalments,
            'filters' => [
                'employee_search' => $employee_search,
            ],
        ]);
    }

    public function create(Request $request)
    {
        $employees = Employee::orderBy('name', 'asc')
            ->get()
            ->map(function ($employee) {
                return [
                    'label' => $employee->name,
                    'value' => $employee->id,
                ];
            });
        return Inertia::render('Instalment/Create', [
            'title' => 'Tambah Angsuran Baru',
            'description' => 'Lengkapi form untuk menambahkan angsuran baru',
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'total_amount' => 'required|numeric|min:0',
            'instalment_value' => 'required|numeric|min:0',
        ]);
        $direct_instalment_payments = [];
        if ($request->has('direct_instalment_payments') && !empty($request->direct_instalment_payments) && is_array($request->direct_instalment_payments) && count($request->direct_instalment_payments) > 0) {
            $direct_instalment_payments = $request->direct_instalment_payments;
        }

        $now = now()->format('Y-m-d');
        $direct_payments_sum = collect($direct_instalment_payments)->sum('payment_value');
        $expected_remaining_amount = $request->total_amount - $direct_payments_sum;
        $instalment = Instalment::create(
            array_merge($request->all(), [
                'remaining_amount' => $expected_remaining_amount,
                'taken_at' => $now,
            ]),
        );

        if (count($direct_instalment_payments) > 0) {
            foreach ($direct_instalment_payments as $instalment_payment) {
                InstalmentPayment::create([
                    'instalment_id' => $instalment->id,
                    'paid_at' => $instalment_payment['paid_at'],
                    'payment_value' => $instalment_payment['payment_value'],
                    'payment_source' => InstalmentPayment::DIRECT_SOURCE,
                    'step' => $this->latestStepInstalment($instalment->id) + 1,
                ]);
            }
        }

        Session::flash('success', 'Angsuran berhasil ditambahkan');
        return Inertia::location('/instalment');
    }

    public function show($id)
    {
        $instalment = Instalment::with([
            'employee.position',
            'payments' => function ($q) {
                $q->orderBy('step', 'asc');
            },
        ])->findOrFail($id);
        return Inertia::render('Instalment/Show', [
            'title' => 'Detail Angsuran',
            'description' => 'Rincian angsuran karyawan',
            'instalment' => $instalment,
        ]);
    }

    public function edit($id)
    {
        $instalment = Instalment::with([
            'employee.position',
            'payments' => function ($q) {
                $q->orderBy('paid_at', 'asc');
            },
        ])->findOrFail($id);
        $employees = Employee::orderBy('name', 'asc')
            ->get()
            ->map(function ($employee) {
                return [
                    'label' => $employee->name,
                    'value' => $employee->id,
                ];
            });

        return Inertia::render('Instalment/Edit', [
            'title' => 'Edit Angsuran',
            'description' => 'Perbarui data angsuran',
            'instalment' => $instalment,
            'employees' => $employees,
        ]);
    }

    public function update(Request $request, $id)
    {
        $instalment = Instalment::with('payments')->findOrFail($id);
        $hasSalaryPayments = $instalment->payments()->where('payment_source', InstalmentPayment::SALARY_SOURCE)->exists();

        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'total_amount' => 'required|numeric|min:0',
            'instalment_value' => 'required|numeric|min:0',
        ]);

        $direct_instalment_payments = [];
        if ($request->has('direct_instalment_payments') && !empty($request->direct_instalment_payments) && is_array($request->direct_instalment_payments) && count($request->direct_instalment_payments) > 0) {
            $direct_instalment_payments = $request->direct_instalment_payments;
        }

        DB::transaction(function () use ($request, $instalment, $hasSalaryPayments, $direct_instalment_payments) {
            // Recalculate remaining amount atomically inside transaction
            $direct_payments_sum = collect($direct_instalment_payments)
                ->filter(function ($payment) {
                    return ($payment['payment_source'] ?? 'direct') === 'direct';
                })
                ->sum('payment_value');
            $salary_payments_sum = $instalment->payments()->where('payment_source', InstalmentPayment::SALARY_SOURCE)->sum('payment_value');
            $expected_remaining_amount = $request->total_amount - ($direct_payments_sum + $salary_payments_sum);
            // Only update core fields if no salary payments exist
            if (!$hasSalaryPayments) {
                $instalment->update(
                    array_merge($request->all(), [
                        'remaining_amount' => $expected_remaining_amount,
                    ]),
                );
            } else {
                // If salary payments exist, only update remaining_amount based on current total
                $instalment->update([
                    'remaining_amount' => $expected_remaining_amount,
                ]);
            }

            // Remove existing direct payments permanently
            $instalment->payments()->where('payment_source', InstalmentPayment::DIRECT_SOURCE)->forceDelete();

            // Prepare combined list: existing salary payments + new direct payments from payload
            $salaryPayments = $instalment
                ->payments()
                ->where('payment_source', InstalmentPayment::SALARY_SOURCE)
                ->orderBy('paid_at', 'asc')
                ->orderBy('id', 'asc')
                ->get()
                ->map(function ($p) {
                    return [
                        'type' => 'existing',
                        'model' => $p,
                        'paid_at' => $p->paid_at,
                        'order' => $p->id, // stable tie-breaker
                    ];
                });

            $directPaymentsOnly = collect($direct_instalment_payments)
                ->filter(function ($payment) {
                    return ($payment['payment_source'] ?? 'direct') === 'direct';
                })
                ->values()
                ->map(function ($payment, $idx) {
                    return [
                        'type' => 'new',
                        'data' => $payment,
                        'paid_at' => $payment['paid_at'] ?? null,
                        'order' => $idx, // keep client order for tie-breaker
                    ];
                });

            $merged = $salaryPayments
                ->merge($directPaymentsOnly)
                ->sort(function ($a, $b) {
                    // Normalize to timestamps; nulls go to the end
                    $toTs = function ($v) {
                        if (!$v) {
                            return PHP_INT_MAX;
                        }
                        if ($v instanceof \DateTimeInterface) {
                            return $v->getTimestamp();
                        }
                        return strtotime((string) $v) ?: PHP_INT_MAX;
                    };
                    $aDate = $toTs($a['paid_at'] ?? null);
                    $bDate = $toTs($b['paid_at'] ?? null);
                    if ($aDate === $bDate) {
                        return $a['order'] <=> $b['order'];
                    }
                    return $aDate <=> $bDate;
                })
                ->values();

            // Re-assign sequential steps based on the sorted order
            $step = 1;
            foreach ($merged as $item) {
                if ($item['type'] === 'existing') {
                    // Update step only for existing salary payments
                    $item['model']->update(['step' => $step]);
                } else {
                    // Create new direct payment with the correct step
                    $data = $item['data'];
                    InstalmentPayment::create([
                        'instalment_id' => $instalment->id,
                        'paid_at' => $data['paid_at'],
                        'payment_value' => $data['payment_value'],
                        'payment_source' => InstalmentPayment::DIRECT_SOURCE,
                        'step' => $step,
                    ]);
                }
                $step++;
            }
        });

        Session::flash('success', 'Angsuran berhasil diperbarui');
        return Inertia::location('/instalment');
    }

    public function destroy($id)
    {
        $instalment = Instalment::with('payments')->findOrFail($id);
        $hasSalaryPayments = $instalment->payments()->where('payment_source', InstalmentPayment::SALARY_SOURCE)->exists();
        if ($hasSalaryPayments) {
            Session::flash('error', 'Tidak dapat menghapus angsuran karena sudah memiliki pembayaran dari gaji.');
            return Inertia::location('/instalment');
        }

        // Soft delete direct payments then the instalment
        $instalment->payments()->where('payment_source', InstalmentPayment::DIRECT_SOURCE)->delete();
        $instalment->delete();

        Session::flash('success', 'Angsuran berhasil dihapus');
        return Inertia::location('/instalment');
    }

    public function print($id)
    {
        $instalment = Instalment::with([
            'employee.position',
            'payments' => function ($q) {
                $q->orderBy('paid_at', 'asc');
            },
        ])->findOrFail($id);
        return Inertia::render('Instalment/Print', [
            'title' => 'Cetak Detail Angsuran',
            'description' => 'CV Sri Slamet',
            'instalment' => $instalment,
        ]);
    }

    public function printLegger(Request $request)
    {
        $validated = $request->validate([
            'legger_mode' => 'required',
            'latest_date' => 'required_if:legger_mode,DATE_RANGE',
            'month' => 'required_if:legger_mode,MONTHLY',
        ]);

        $query = Instalment::with('employee.position');

        $dateFilter = function ($q) use ($validated) {
            if ($validated['legger_mode'] === 'DATE_RANGE') {
                $q->where('paid_at', '<=', $validated['latest_date']);
            } elseif ($validated['legger_mode'] === 'MONTHLY') {
                $q->whereYear('paid_at', '<=', now()->year)->whereMonth('paid_at', '<=', $validated['month']);
            }
        };

        $leggerData = $query
             // Start: Skip lunas, kecuali pembayaran terakhir masih di minggu ini (Sabtu-Jumat)
            ->where(function ($query) {
                $query->where('remaining_amount', '>', 0)
                    ->orWhere(function ($q) {
                        $now = now();
                        $startOfWeek = $now->copy()->subDays(($now->dayOfWeek + 1) % 7);
                        $endOfWeek = $startOfWeek->copy()->addDays(6)->setTime(23, 59, 59);

                        $q->where('remaining_amount', '<=', 0)
                            ->whereHas('payments', function ($paymentQuery) use ($startOfWeek, $endOfWeek) {
                                $paymentQuery->orderByDesc('paid_at')
                                    ->limit(1)
                                    ->whereBetween('paid_at', [$startOfWeek->format('Y-m-d 00:00:00'), $endOfWeek->format('Y-m-d 23:59:59')]);
                            });
                    });
            })
            // End: Skip lunas
            ->where(function ($q) use ($dateFilter) {
                $q->whereHas('payments', $dateFilter)
                  ->orWhereDoesntHave('payments');
            })
            ->with(['payments' => $dateFilter])
            ->orderBy(
                Employee::select('name')
                    ->whereColumn('employees.id', 'instalments.employee_id'),
                'asc'
            )
            ->get();

        return Inertia::render('Instalment/PrintLegger', [
            'title' => 'Cetak Legger Angsuran',
            'description' => 'CV Sri Slamet',
            'instalments' => $leggerData,
            'filters' => [
                'legger_mode' => $validated['legger_mode'],
                'latest_date' => $validated['latest_date'] ?? null,
                'month' => $validated['month'] ?? null,
                'year' => now()->year,
            ],
        ]);
    }
}
