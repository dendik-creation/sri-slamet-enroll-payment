import React, { useState } from "react";
import AppLayout from "@/Partials/AppLayout";
import { PageTitle } from "@/Partials/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { floatToIdCurrency, ymdToIdDate } from "@/Components/helper/helper";
import {
    TrendingUp,
    TrendingDown,
    Calendar,
    Users,
    Receipt,
    DollarSign,
    Filter,
} from "lucide-react";
import { router } from "@inertiajs/react";
import { ExpenseIndexProps } from "@/types/expense";
import { DatePickerInput } from "@/Components/custom/FormElement";
import DynamicCard from "@/Components/custom/DynamicCard";

const ExpenseIndex: React.FC<ExpenseIndexProps> = ({
    title,
    description,
    filters,
    summary,
    expense_by_employee,
    expense_by_date,
}) => {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleFilter = () => {
        router.get("/expense", {
            start_date: startDate,
            end_date: endDate,
        });
    };

    const isPositiveChange = summary.percentage_change >= 0;

    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            {/* Filter Section */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Filter Periode
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label
                                className="text-sm mb-1 block font-medium"
                                htmlFor="start_date"
                            >
                                Tanggal Mulai
                            </label>
                            <DatePickerInput
                                value={startDate}
                                mode="single"
                                placeholder="Pilih Tanggal Mulai"
                                onChange={(value) =>
                                    setStartDate(value as string)
                                }
                            />
                        </div>
                        <div>
                            <label
                                className="text-sm mb-1 block font-medium"
                                htmlFor="end_date"
                            >
                                Tanggal Akhir
                            </label>
                            <DatePickerInput
                                value={endDate}
                                mode="single"
                                placeholder="Pilih Tanggal Akhir"
                                onChange={(value) =>
                                    setEndDate(value as string)
                                }
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={handleFilter}
                                variant={"green"}
                                className="w-full gap-2 flex items-center"
                            >
                                <Filter />
                                Terapkan Filter
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <DynamicCard
                    title="Total Pengeluaran"
                    value={floatToIdCurrency(summary.total_expense)}
                    icon={<DollarSign className="w-32 h-32 text-blue-200" />}
                    color="blue"
                    subfooter={
                        <div className="flex items-center mt-2">
                            {isPositiveChange ? (
                                <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                            )}
                            <span
                                className={`text-sm ${
                                    isPositiveChange
                                        ? "text-red-500"
                                        : "text-green-500"
                                }`}
                            >
                                {Math.abs(summary.percentage_change)}% dari
                                periode sebelumnya
                            </span>
                        </div>
                    }
                />
                <DynamicCard
                    title="Gaji Bersih"
                    value={floatToIdCurrency(summary.total_salary_expense)}
                    icon={<Users className="w-32 h-32 text-green-200" />}
                    color="green"
                    subfooter={
                        <div className="text-sm text-muted-foreground mt-2">
                            {summary.employee_count} karyawan
                        </div>
                    }
                />
                <DynamicCard
                    title="Angsuran Dibayar"
                    value={floatToIdCurrency(summary.total_instalment_expense)}
                    icon={<Receipt className="w-32 h-32 text-yellow-200" />}
                    color="yellow"
                    subfooter={
                        <div className="text-sm text-muted-foreground mt-2">
                            Pembayaran pinjaman
                        </div>
                    }
                />
                <DynamicCard
                    title="Pengeluaran THR"
                    value={floatToIdCurrency(summary.total_thr_expense)}
                    icon={<Receipt className="w-32 h-32 text-purple-200" />}
                    color="purple"
                    subfooter={
                        <div className="text-sm text-muted-foreground mt-2">
                            {summary.thr_transactions} transaksi THR
                        </div>
                    }
                />
            </div>

            {/* Detailed Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <DynamicCard
                    title="Gaji Pokok"
                    value={floatToIdCurrency(summary.total_basic_salary)}
                    icon={<DollarSign className="w-20 h-20 text-blue-100" />}
                    color="blue"
                />
                <DynamicCard
                    title="Gaji Lembur"
                    value={floatToIdCurrency(summary.total_overtime_salary)}
                    icon={<DollarSign className="w-20 h-20 text-green-100" />}
                    color="green"
                />
                <DynamicCard
                    title="Total Potongan"
                    value={floatToIdCurrency(summary.total_deductions)}
                    icon={<DollarSign className="w-20 h-20 text-red-100" />}
                    color="red"
                />
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Pengeluaran per Karyawan</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Breakdown pengeluaran untuk setiap karyawan termasuk
                        gaji bersih, angsuran, dan THR
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border mb-5">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        NIP
                                    </TableHead>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        Nama Karyawan
                                    </TableHead>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        Posisi
                                    </TableHead>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        Gaji Bersih
                                    </TableHead>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        Angsuran
                                    </TableHead>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        THR
                                    </TableHead>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        Total Pengeluaran
                                    </TableHead>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        Transaksi Gaji
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expense_by_employee.map((item) => (
                                    <TableRow key={item.employee.id}>
                                        <TableCell>
                                            {item.employee.nip}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {item.employee.name}
                                        </TableCell>
                                        <TableCell>
                                            {item.employee.position?.name ??
                                                "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {floatToIdCurrency(
                                                item.total_net_salary
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {floatToIdCurrency(
                                                item.total_instalment_payments
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {floatToIdCurrency(item.thr_amount)}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {floatToIdCurrency(
                                                item.total_expense
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.salary_count}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Daily Expense Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Pengeluaran Harian</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Breakdown pengeluaran per hari termasuk gaji, angsuran,
                        dan THR
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        Tanggal
                                    </TableHead>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        Gaji Bersih
                                    </TableHead>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        Angsuran
                                    </TableHead>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        THR
                                    </TableHead>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        Total Pengeluaran
                                    </TableHead>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        Jumlah Karyawan
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expense_by_date.map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>
                                            {ymdToIdDate(item.date)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {floatToIdCurrency(
                                                item.salary_expense
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {floatToIdCurrency(
                                                item.instalment_expense
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {floatToIdCurrency(
                                                item.thr_expense
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {floatToIdCurrency(
                                                item.total_expense
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.employee_count}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
};

export default ExpenseIndex;
