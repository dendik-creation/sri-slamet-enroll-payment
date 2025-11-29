import AppLayout from "@/Partials/AppLayout";
import { PageTitle } from "@/Partials/PageTitle";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    MultiSelectSearchInput,
    SelectSearchInput,
    ErrorInput,
} from "@/Components/custom/FormElement";
import { useForm } from "@inertiajs/react";
import { Save, Loader } from "lucide-react";
import { useMemo, FormEvent } from "react";
import { SelectOption } from "@/types/global";
import { SalaryDeduction } from "@/types/salaries";
import { cn } from "@/lib/utils";

export type SalaryDeductionCreateProps = {
    title: string;
    description: string;
    employees: SelectOption[];
};

export default function SalaryDeductionCreate({
    title,
    description,
    employees,
}: SalaryDeductionCreateProps) {
    const employeeOptions = useMemo(
        () =>
            employees.map((e) => ({ label: e.label, value: String(e.value) })),
        [employees]
    );

    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        amount: number;
        target_employee: SalaryDeduction["target_employee"] | "";
        frequency: NonNullable<SalaryDeduction["frequency"]>;
        specific_employee_id?: number[];
    }>({
        name: "",
        amount: 0,
        target_employee: "all",
        frequency: "per_payrun",
        specific_employee_id: [],
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (
            !data.name.trim() ||
            data.amount === 0 ||
            data.target_employee === "" ||
            (data.target_employee === "specific" &&
                (!data.specific_employee_id ||
                    data.specific_employee_id.length === 0))
        )
            return;

        post("/salary-deduction", {
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            <form onSubmit={handleSubmit}>
                <div className="mb-5 flex items-start gap-3">
                    <div className="flex flex-col w-full">
                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            Nama Potongan Gaji
                        </label>
                        <Input
                            type="text"
                            required
                            value={data.name}
                            onChange={(e) =>
                                setData({ ...data, name: e.target.value })
                            }
                            placeholder="Masukkan Nama Potongan"
                            className={cn(errors.name && "border-red-500")}
                        />
                        {errors.name && <ErrorInput error={errors.name} />}
                    </div>
                    <div className="flex flex-col w-full">
                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            Jumlah Potongan
                        </label>
                        <Input
                            type="number"
                            required
                            value={data.amount}
                            onChange={(e) =>
                                setData({
                                    ...data,
                                    amount: Number(e.target.value),
                                })
                            }
                            placeholder="Masukkan Jumlah Potongan"
                            className={cn(errors.amount && "border-red-500")}
                        />
                        {errors.amount && <ErrorInput error={errors.amount} />}
                    </div>
                </div>

                <div className="mb-5 flex items-start gap-3">
                    <div className="flex flex-col w-full">
                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            Target Karyawan
                        </label>
                        <SelectSearchInput
                            value={data.target_employee}
                            onChange={(value) =>
                                setData({
                                    ...data,
                                    target_employee: value.toString() as any,
                                    specific_employee_id:
                                        value.toString() === "specific"
                                            ? data.specific_employee_id || []
                                            : [],
                                })
                            }
                            placeholder="Pilih Target Karyawan"
                            options={[
                                { value: "all", label: "Semua Karyawan" },
                                { value: "monthly", label: "Karyawan Bulanan" },
                                { value: "daily", label: "Karyawan Harian" },
                                {
                                    value: "specific",
                                    label: "Karyawan Tertentu",
                                },
                            ]}
                            removeValue={() =>
                                setData({ ...data, target_employee: "" as any })
                            }
                            className={cn(
                                errors.target_employee && "border-red-500"
                            )}
                        />
                        {errors.target_employee && (
                            <ErrorInput error={errors.target_employee} />
                        )}
                        {data.target_employee === "specific" && (
                            <div className="mt-3 max-w-2xl min-h-9.5">
                                <MultiSelectSearchInput
                                    values={(
                                        data.specific_employee_id || []
                                    ).map((id) => String(id))}
                                    onChange={(vals) =>
                                        setData({
                                            ...data,
                                            specific_employee_id: vals.map(
                                                (v) => Number(v)
                                            ),
                                        })
                                    }
                                    options={employeeOptions}
                                    placeholder="Pilih karyawan"
                                />
                                {errors.specific_employee_id && (
                                    <div className="mt-1">
                                        <ErrorInput
                                            error={
                                                errors.specific_employee_id as any
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col w-full">
                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            Frekuensi Potongan
                        </label>
                        <SelectSearchInput
                            value={data.frequency}
                            onChange={(value) =>
                                setData({
                                    ...data,
                                    frequency: value.toString() as any,
                                })
                            }
                            placeholder="Pilih Frekuensi"
                            options={[
                                { value: "per_payrun", label: "Setiap Gajian" },
                                {
                                    value: "monthly_once",
                                    label: "Sekali per Bulan",
                                },
                            ]}
                            removeValue={() =>
                                setData({ ...data, frequency: "per_payrun" })
                            }
                            className={cn(errors.frequency && "border-red-500")}
                        />
                        {errors.frequency && (
                            <ErrorInput error={errors.frequency} />
                        )}
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full mt-4 p-3 bg-amber-500 hover:bg-amber-600"
                    disabled={processing}
                >
                    {processing ? (
                        <Loader className="animate-spin" />
                    ) : (
                        <span className="flex items-center gap-2">
                            <Save />
                            <span>Simpan</span>
                        </span>
                    )}
                </Button>
            </form>
        </AppLayout>
    );
}
