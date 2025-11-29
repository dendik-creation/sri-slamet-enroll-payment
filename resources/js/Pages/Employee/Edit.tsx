import {
    DatePickerInput,
    ErrorInput,
    SelectSearchInput,
} from "@/Components/custom/FormElement";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { cn } from "@/lib/utils";
import AppLayout from "@/Partials/AppLayout";
import { PageTitle } from "@/Partials/PageTitle";
import { EmployeeEditProps, EmployeeFormData } from "@/types/employee";
import { useForm } from "@inertiajs/react";
import { Loader, Save } from "lucide-react";
import React from "react";

const EmployeeEdit = ({
    title,
    description,
    positions,
    employee,
}: EmployeeEditProps) => {
    const {
        data,
        setData,
        put,
        processing,
        errors,
        setError,
        clearErrors,
        reset,
    } = useForm<EmployeeFormData>({
        name: employee.name || "",
        nip: employee.nip || "",
        salary_per_day: employee.salary_per_day || null,
        salary_per_month: employee.salary_per_month || null,
        salary_type: employee.salary_type || null,
        position_id: employee.position_id || null,
        join_date: employee.join_date || null,
    });

    const estimateSalaryPerDay = (
        salaryPerMonth: number,
        daysInMonth: number = 30
    ) => {
        const dailySalary = salaryPerMonth / daysInMonth;

        // Round to nearest integer
        const salaryInt = Math.round(dailySalary);
        const hundreds = salaryInt % 1000;
        const main = salaryInt - hundreds;

        if (hundreds < 500) {
            return main;
        } else {
            return main + 1000;
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setData(name as keyof EmployeeFormData, value);
        if (name == "salary_per_month") {
            const salary_per_day = estimateSalaryPerDay(Number(value));
            setData("salary_per_day", salary_per_day);
        }
    };

    const validateForm = (): boolean => {
        clearErrors();
        let valid = true;

        if (!data.nip || data.nip.trim() === "") {
            setError("nip", "NIP wajib diisi");
            valid = false;
        }
        if (!data.name || data.name.trim() === "") {
            setError("name", "Nama wajib diisi");
            valid = false;
        }
        if (!data.position_id) {
            setError("position_id", "Jabatan wajib dipilih");
            valid = false;
        }
        if (!data.join_date || data.join_date === "") {
            setError("join_date", "Tanggal bergabung wajib diisi");
            valid = false;
        }
        if (!data.salary_type) {
            setError("salary_type", "Tipe gaji wajib dipilih");
            valid = false;
        }
        if (
            data.salary_per_day === null ||
            isNaN(Number(data.salary_per_day))
        ) {
            setError("salary_per_day", "Gaji harian wajib diisi");
            valid = false;
        }
        if (
            data.salary_type === "monthly" &&
            (data.salary_per_month === null ||
                isNaN(Number(data.salary_per_month)))
        ) {
            setError("salary_per_month", "Gaji bulanan wajib diisi");
            valid = false;
        }

        return valid;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;
        put(`/employee/${employee.id}`, {
            onSuccess: () => {
                reset();
            },
        });
    };
    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            <form onSubmit={handleSubmit}>
                <div className="mb-5 flex items-start gap-3">
                    <div className="flex flex-col w-full">
                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            NIP Karyawan
                        </label>
                        <Input
                            type="text"
                            name="nip"
                            id="nip"
                            placeholder="Masukkan NIP"
                            value={data.nip ?? ""}
                            onChange={handleChange}
                            className={cn(errors.nip && "border-red-500")}
                        />
                        {errors.nip && <ErrorInput error={errors.nip} />}
                    </div>
                    <div className="flex flex-col w-full">
                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            Nama Karyawan
                        </label>
                        <Input
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Masukkan Nama"
                            value={data.name ?? ""}
                            onChange={handleChange}
                            className={cn(errors.name && "border-red-500")}
                        />
                        {errors.name && <ErrorInput error={errors.name} />}
                    </div>
                </div>
                <div className="mb-5 flex items-start gap-3">
                    <div className="flex flex-col w-full">
                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            Jabatan (Posisi)
                        </label>
                        <SelectSearchInput
                            value={data.position_id?.toString() || ""}
                            options={positions}
                            onChange={(value) =>
                                setData(
                                    "position_id",
                                    value ? Number(value) : null
                                )
                            }
                            placeholder="Pilih Jabatan"
                            removeValue={() => setData("position_id", null)}
                            className={cn(
                                errors.position_id && "border-red-500"
                            )}
                        />
                        {errors.position_id && (
                            <ErrorInput error={errors.position_id} />
                        )}
                    </div>
                    <div className="flex flex-col w-full">
                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            Tanggal Bergabung
                        </label>
                        <DatePickerInput
                            value={data.join_date?.toString() || ""}
                            onChange={(value) =>
                                setData(
                                    "join_date",
                                    value ? new Date(value) : null
                                )
                            }
                            mode="single"
                            placeholder="Pilih Tanggal Bergabung"
                            className={cn(errors.join_date && "border-red-500")}
                        />
                        {errors.join_date && (
                            <ErrorInput error={errors.join_date} />
                        )}
                    </div>
                </div>
                <div className="mb-5 flex items-start gap-3">
                    <div className="flex flex-col w-full">
                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            Tipe Gaji
                        </label>
                        <SelectSearchInput
                            value={data.salary_type || ""}
                            options={[
                                { value: "daily", label: "Harian" },
                                { value: "monthly", label: "Bulanan" },
                            ]}
                            onChange={(value) => {
                                setData(
                                    "salary_type",
                                    value as EmployeeFormData["salary_type"]
                                );
                                if (value == "monthly") {
                                    setData("salary_per_day", null);
                                }
                            }}
                            placeholder="Pilih Tipe Gaji"
                            removeValue={() => setData("salary_type", null)}
                            className={cn(
                                errors.salary_type && "border-red-500"
                            )}
                        />
                        {errors.salary_type && (
                            <ErrorInput error={errors.salary_type} />
                        )}
                    </div>
                    <div className="flex flex-col w-full">
                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            {data.salary_type && data.salary_type == "monthly"
                                ? "Gaji Harian (Perkiraan Otomatis)"
                                : "Gaji Harian"}
                        </label>
                        <Input
                            type="number"
                            name="salary_per_day"
                            id="salary_per_day"
                            placeholder="Masukkan Gaji Harian"
                            value={data.salary_per_day ?? ""}
                            onChange={handleChange}
                            readOnly={data.salary_type == "monthly"}
                            className={cn(
                                errors.salary_per_day && "border-red-500"
                            )}
                        />
                        {errors.salary_per_day && (
                            <ErrorInput error={errors.salary_per_day} />
                        )}
                    </div>
                    {data.salary_type == "monthly" && (
                        <div className="flex flex-col w-full">
                            <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                Gaji Bulanan
                            </label>
                            <Input
                                type="number"
                                name="salary_per_month"
                                id="salary_per_month"
                                placeholder="Masukkan Gaji Bulanan"
                                value={data.salary_per_month ?? ""}
                                onChange={handleChange}
                                className={cn(
                                    errors.salary_per_month && "border-red-500"
                                )}
                            />
                            {errors.salary_per_month && (
                                <ErrorInput error={errors.salary_per_month} />
                            )}
                        </div>
                    )}
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
                            <Save />
                            <span>Perbarui</span>
                        </span>
                    )}
                </Button>
            </form>
        </AppLayout>
    );
};

export default EmployeeEdit;
