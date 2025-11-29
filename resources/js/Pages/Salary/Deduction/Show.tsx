import AppLayout from "@/Partials/AppLayout";
import { PageTitle, PageTitleProps } from "@/Partials/PageTitle";
import { EmployeeDeduction, SalaryDeduction } from "@/types/salaries";
import { floatToIdCurrency, ymdToIdDate } from "@/Components/helper/helper";
import { Card, CardContent } from "@/Components/ui/card";
import React from "react";
import {
    BanknoteArrowUp,
    IdCardLanyard,
    Printer,
    SearchXIcon,
    TicketPercent,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { SelectOption } from "@/types/global";
import { SelectSearchInput } from "@/Components/custom/FormElement";
import { Link, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";

type SalaryDeductionShowProps = PageTitleProps & {
    salary_deduction: SalaryDeduction;
    current_month: number;
    current_year: number;
    employee_deductions: EmployeeDeduction[];
};

const months: SelectOption[] = [
    { label: "Januari", value: "1" },
    { label: "Februari", value: "2" },
    { label: "Maret", value: "3" },
    { label: "April", value: "4" },
    { label: "Mei", value: "5" },
    { label: "Juni", value: "6" },
    { label: "Juli", value: "7" },
    { label: "Agustus", value: "8" },
    { label: "September", value: "9" },
    { label: "Oktober", value: "10" },
    { label: "November", value: "11" },
    { label: "Desember", value: "12" },
];

const SalaryDeductionShow = ({
    title,
    description,
    salary_deduction,
    current_month,
    current_year,
    employee_deductions,
}: SalaryDeductionShowProps) => {
    const handleMonthChange = (month: string | number) => {
        router.get(
            "/salary-deduction/" + salary_deduction.id,
            {
                month: month,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };
    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            <div className="mt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Card className="py-3">
                        <CardContent className="px-3">
                            <div className="flex items-center gap-3 mb-2">
                                <TicketPercent className="text-slate-400" />
                                <h3 className="font-semibold">
                                    Informasi Potongan Gaji
                                </h3>
                            </div>
                            <div className="text-sm flex flex-col gap-2">
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        Jumlah Potongan
                                    </span>
                                    <span>
                                        {floatToIdCurrency(
                                            salary_deduction.amount
                                        )}
                                    </span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        Target Karyawan
                                    </span>
                                    <span>
                                        {salary_deduction.target_employee ===
                                        "all"
                                            ? "Semua Karyawan"
                                            : salary_deduction.target_employee ===
                                              "monthly"
                                            ? "Karyawan Bulanan"
                                            : salary_deduction.target_employee ===
                                              "daily"
                                            ? "Karyawan Harian"
                                            : "Karyawan Tertentu"}
                                    </span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        Frekuensi Pembayaran
                                    </span>
                                    <span>
                                        {salary_deduction.frequency ==
                                        "per_payrun"
                                            ? "Setiap Periode Pembayaran"
                                            : "Bulanan Sekali"}
                                    </span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        Total Dana yang Masuk (sejak dibuat)
                                    </span>
                                    <span>
                                        {floatToIdCurrency(
                                            salary_deduction.received_amount_total ??
                                                0
                                        )}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {salary_deduction.target_employee == "specific" &&
                        salary_deduction.specific_employee_id &&
                        salary_deduction?.specific_employees && (
                            <Card className="py-3">
                                <CardContent className="px-3">
                                    <div className="flex items-center gap-3 mb-2">
                                        <IdCardLanyard className="text-slate-400" />
                                        <h3 className="font-semibold">
                                            Daftar Karyawan Tertentu
                                        </h3>
                                    </div>
                                    <div className="text-sm grid xl:grid-cols-2 grid-cols-1 gap-2">
                                        {salary_deduction?.specific_employees?.map(
                                            (emp, idx) => (
                                                <span key={idx}>- {emp}</span>
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                </div>

                <Card className="py-3">
                    <CardContent className="px-3">
                        <div className="flex items-center gap-3 mb-2">
                            <BanknoteArrowUp className="text-slate-400" />
                            <h3 className="font-semibold">
                                Riwayat Pembayaran {salary_deduction.name}{" "}
                            </h3>
                        </div>

                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span>Data untuk bulan</span>
                                    <div className="">
                                        <SelectSearchInput
                                            value={current_month.toString()}
                                            onChange={(month) =>
                                                handleMonthChange(month)
                                            }
                                            placeholder="Pilih bulan"
                                            options={months}
                                        />
                                    </div>
                                </div>
                                <span>
                                    Total dana masuk :{" "}
                                    <strong>
                                        {floatToIdCurrency(
                                            employee_deductions.reduce(
                                                (sum, emp) => sum + emp.amount,
                                                0
                                            ) ?? 0
                                        )}
                                    </strong>
                                </span>
                            </div>
                            {employee_deductions.length > 0 && (
                                <Link
                                    href={
                                        "/salary-deduction/" +
                                        salary_deduction.id +
                                        "/print"
                                    }
                                >
                                    <Button variant={"green"}>
                                        <Printer />
                                        <span>Cetak Laporan</span>
                                    </Button>
                                </Link>
                            )}
                        </div>

                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="bg-amber-200 font-semibold">
                                            #
                                        </TableHead>
                                        <TableHead className="bg-amber-200 font-semibold">
                                            NIP
                                        </TableHead>
                                        <TableHead className="bg-amber-200 font-semibold">
                                            Karyawan
                                        </TableHead>
                                        <TableHead className="bg-amber-200 font-semibold">
                                            Tanggal Pembayaran
                                        </TableHead>
                                        <TableHead className="bg-amber-200 font-semibold">
                                            Nominal Potongan
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {employee_deductions?.map(
                                        (emp_deduction, idx) => (
                                            <TableRow key={emp_deduction.id}>
                                                <TableCell>{idx + 1}</TableCell>
                                                <TableCell>
                                                    {emp_deduction.employee.nip}
                                                </TableCell>
                                                <TableCell>
                                                    {
                                                        emp_deduction.employee
                                                            .name
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {ymdToIdDate(
                                                        emp_deduction?.created_at ||
                                                            ""
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {floatToIdCurrency(
                                                        emp_deduction.amount
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}

                                    {employee_deductions === undefined ||
                                        (employee_deductions?.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="h-24 text-center"
                                                >
                                                    <div className="w-full flex flex-col items-center justify-center h-full gap-2">
                                                        <SearchXIcon
                                                            width={64}
                                                            className="text-red-400"
                                                        />
                                                        <span>
                                                            Data tidak ada
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default SalaryDeductionShow;
