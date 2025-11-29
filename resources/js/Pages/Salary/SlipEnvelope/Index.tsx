import {
    DatePickerInput,
    SelectSearchInput,
} from "@/Components/custom/FormElement";
import { ymdToIdDate } from "@/Components/helper/helper";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import AppLayout from "@/Partials/AppLayout";
import { PageTitle } from "@/Partials/PageTitle";
import { SalarySlipEnvelopeIndexProps } from "@/types/salaries";
import { router, useForm } from "@inertiajs/react";
import { ClipboardType, Loader, Printer, ScanSearch } from "lucide-react";
import React from "react";

const months = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
];

const SalarySlipEnvelopeIndex = ({
    title,
    description,
    period_start,
    period_end,
    current_month,
}: SalarySlipEnvelopeIndexProps) => {
    const { data, setData, errors, processing, get, reset } = useForm({
        period_start: period_start || "",
        period_end: period_end || "",
        employee_type: "daily" as "monthly" | "daily",
        selected_month: current_month || "",
    });

    const handleChange = (value: string, name: string) => {
        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        get("/slip-envelope/print", {
            preserveState: true,
            replace: true,
            onSuccess: () => reset(),
        });
    };
    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            <div className="">
                <div className="mb-2">
                    Lengkapi form dibawah untuk generate amplop slip gaji
                    karyawan
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-3">
                        <Card className="py-3">
                            <CardContent className="px-3">
                                <div className="flex items-center gap-3 mb-2">
                                    <ClipboardType className="text-slate-400" />
                                    <h3 className="font-semibold">
                                        Form Cetak Amplop Slip Gaji
                                    </h3>
                                </div>

                                <div className="flex flex-col w-full mb-2">
                                    <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                        Target Karyawan (Tipe Gaji)
                                    </label>
                                    <SelectSearchInput
                                        value={data.employee_type}
                                        options={[
                                            {
                                                value: "daily",
                                                label: "Karyawan Harian",
                                            },
                                            {
                                                value: "monthly",
                                                label: "Karyawan Bulanan",
                                            },
                                        ]}
                                        placeholder="Pilih target karyawan"
                                        onChange={(value) =>
                                            handleChange(
                                                value.toString(),
                                                "employee_type"
                                            )
                                        }
                                        removeValue={() =>
                                            handleChange("", "employee_type")
                                        }
                                    />
                                </div>
                                {data.employee_type == "daily" ? (
                                    <div className="flex flex-col w-full mb-2">
                                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                            Periode Tanggal
                                        </label>
                                        <DatePickerInput
                                            className="w-full"
                                            value={{
                                                from: new Date(
                                                    data.period_start
                                                ),
                                                to: new Date(data.period_end),
                                            }}
                                            placeholder="Pilih rentang tanggal"
                                            onChange={(dateRange) => {
                                                if (
                                                    dateRange &&
                                                    typeof dateRange ===
                                                        "string"
                                                ) {
                                                    const [start, end] =
                                                        dateRange.split(" - ");
                                                    setData((prev) => ({
                                                        ...prev,
                                                        period_start: start,
                                                        period_end: end,
                                                    }));
                                                }
                                            }}
                                            mode="range"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col w-full mb-2">
                                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                            Periode Bulan
                                        </label>
                                        <SelectSearchInput
                                            value={data.selected_month}
                                            options={months}
                                            placeholder="Pilih bulan"
                                            onChange={(value) =>
                                                handleChange(
                                                    value.toString(),
                                                    "selected_month"
                                                )
                                            }
                                            removeValue={() =>
                                                handleChange(
                                                    "",
                                                    "selected_month"
                                                )
                                            }
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        {/* Preview Start */}
                        <Card className="py-3">
                            <CardContent className="px-3">
                                <div className="flex items-center gap-3 mb-2">
                                    <ScanSearch className="text-slate-400" />
                                    <h3 className="font-semibold">Preview</h3>
                                </div>
                                {/* Envelope Preview */}
                                <div className="w-full">
                                    {(() => {
                                        // Fallbacks for preview (can be replaced by real settings later)
                                        const companyName = "CV Sri Slamet";
                                        const companyAddress =
                                            "Jl.KH.Agus Salim 170";
                                        const currentYear =
                                            new Date().getFullYear();
                                        const monthLabel =
                                            months.find(
                                                (m) =>
                                                    m.value ===
                                                    data.selected_month
                                            )?.label || "";

                                        if (data.employee_type === "daily") {
                                            return (
                                                <div className="border rounded-md bg-white px-6 py-4 h-[220px] flex flex-col justify-between shadow-sm">
                                                    <div className="space-y-1 text-slate-800">
                                                        <div className="font-semibold text-lg leading-tight">
                                                            {companyName}
                                                        </div>
                                                        <div className="text-sm text-slate-600 leading-tight">
                                                            {companyAddress}
                                                        </div>
                                                        <div className="text-sm mt-2">
                                                            Gaji Mingguan{", "}
                                                            {data.period_start &&
                                                            data.period_end
                                                                ? `${ymdToIdDate(
                                                                      data.period_start
                                                                  )} - ${ymdToIdDate(
                                                                      data.period_end
                                                                  )}`
                                                                : "(pilih periode)"}
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <div className="text-slate-400 select-none">
                                                            _______________________
                                                        </div>
                                                        <div className="font-medium text-slate-800">
                                                            Nama Karyawan
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Monthly preview
                                        return (
                                            <div className="border rounded-md bg-white px-6 py-4 h-[220px] flex flex-col justify-between shadow-sm">
                                                <div className="space-y-1 text-slate-800">
                                                    <div className="font-semibold text-lg leading-tight">
                                                        {companyName}
                                                    </div>
                                                    <div className="text-sm text-slate-600 leading-tight">
                                                        {companyAddress}
                                                    </div>
                                                    <div className="text-sm mt-2">
                                                        Gaji Bulanan STAFF
                                                    </div>
                                                    <div className="text-sm">
                                                        01{" "}
                                                        {monthLabel ||
                                                            "(pilih bulan)"}{" "}
                                                        {currentYear}
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <div className="text-slate-400 select-none">
                                                        ________________________
                                                    </div>
                                                    <div className="font-medium text-slate-800">
                                                        Nama Karyawan
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </CardContent>
                        </Card>
                        {/* Preview End */}
                    </div>
                    <Button
                        type="submit"
                        className="w-full mt-4 p-3 bg-green-500 hover:bg-green-600"
                        disabled={processing}
                    >
                        {processing ? (
                            <Loader className="animate-spin" />
                        ) : (
                            <span className="flex items-center gap-2">
                                <Printer />
                                <span>Cetak</span>
                            </span>
                        )}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
};

export default SalarySlipEnvelopeIndex;
