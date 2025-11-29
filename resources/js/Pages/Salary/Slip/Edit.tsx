import React from "react";
import { useForm } from "@inertiajs/react";
import AppLayout from "@/Partials/AppLayout";
import { PageTitle } from "@/Partials/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { floatToIdCurrency } from "@/Components/helper/helper";
import {
    HandCoins,
    IdCardLanyard,
    Edit,
    Trash2,
    Plus,
    Save,
} from "lucide-react";
import { SalarySlipEditProps, SalaryBonusEdit } from "@/types/salaries";
import { SelectSearchInput } from "@/Components/custom/FormElement";
import ConfirmDialog from "@/Components/custom/ConfirmDialog";

type DeductionEdit = {
    deduction_id: number | null;
    name: string;
    amount: number;
};

const SalarySlipEdit: React.FC<SalarySlipEditProps> = ({
    title,
    description,
    salary,
    deductions_list,
}) => {
    const { data, setData, put, processing, errors } = useForm({
        total_work_days: salary.total_work_days,
        total_overtime_hours: salary.total_overtime_hours,
        basic_salary: salary.basic_salary,
        overtime_salary: salary.overtime_salary,
        net_salary: salary.net_salary,
        bonuses: (salary.bonuses?.map((bonus) => ({
            id: bonus.id,
            bonus_type: bonus.bonus_type,
            amount: bonus.amount,
        })) || []) as SalaryBonusEdit[],
        deductions: (salary.deductions?.map((d: any) => ({
            deduction_id: d.deduction_id ?? null,
            name: d.deduction?.name ?? "-",
            amount: d.amount ?? 0,
        })) || []) as DeductionEdit[],
    });
    const parseAmountFromOptionLabel = (label: string): number => {
        // Expect label format: "Name (1.234.567)" -> extract digits inside parentheses
        const match = label.match(/\(([^)]+)\)/);
        if (!match) return 0;
        const numeric = match[1].replace(/[^0-9]/g, "");
        return parseInt(numeric || "0", 10) || 0;
    };

    const addDeduction = () => {
        setData("deductions", [
            ...((data.deductions as DeductionEdit[]) || []),
            { deduction_id: null, name: "", amount: 0 },
        ] as any);
    };

    const removeDeduction = (index: number) => {
        const next = (data.deductions as DeductionEdit[]).filter(
            (_, i) => i !== index
        );
        setData("deductions", next as any);
    };

    const onChangeDeduction = (index: number, value: string | number) => {
        const selected = deductions_list.find(
            (opt) => String(opt.value) === String(value)
        );

        const amount = selected ? Number(selected.other_info?.amount ?? 0) : 0;

        const name = selected
            ? selected.label.replace(/\s*\([^)]*\)\s*$/, "")
            : "";

        const next = [...((data.deductions as DeductionEdit[]) || [])];
        next[index] = {
            deduction_id: value === "" ? null : Number(value),
            name,
            amount,
        };
        setData("deductions", next as any);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/salary-slip/update/${salary.id}`, {
            preserveScroll: true,
        });
    };

    const addBonus = () => {
        setData("bonuses", [
            ...data.bonuses,
            {
                id: null,
                bonus_type: "",
                amount: 0,
            } as SalaryBonusEdit,
        ]);
    };

    const removeBonus = (index: number) => {
        const newBonuses = data.bonuses.filter((_, i) => i !== index);
        setData("bonuses", newBonuses);
    };

    const updateBonus = (index: number, field: string, value: any) => {
        const newBonuses = [...data.bonuses];
        newBonuses[index] = { ...newBonuses[index], [field]: value };
        setData("bonuses", newBonuses);
    };

    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Employee Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <IdCardLanyard className="text-slate-400" />
                            Informasi Karyawan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    NIP
                                </label>
                                <p className="text-base font-semibold">
                                    {salary.employee.nip}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Nama Karyawan
                                </label>
                                <p className="text-base font-semibold">
                                    {salary.employee.name}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Jabatan
                                </label>
                                <p className="text-base font-semibold">
                                    {salary.employee.position?.name || "-"}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">
                                    Tanggal Gaji
                                </label>
                                <p className="text-base font-semibold">
                                    {new Date(
                                        salary.salary_date
                                    ).toLocaleDateString("id-ID")}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Salary Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <HandCoins className="text-slate-400" />
                            Edit Informasi Gaji
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label
                                    htmlFor="basic_salary"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Total Hari Kerja{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="total_work_days"
                                    type="number"
                                    value={data.total_work_days}
                                    onChange={(e) =>
                                        setData(
                                            "total_work_days",
                                            parseInt(e.target.value) || 0
                                        )
                                    }
                                    placeholder="Masukkan total hari kerja"
                                    className={
                                        errors.total_work_days
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.total_work_days && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.total_work_days}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="overtime_hours"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Total Jam Lembur{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="total_overtime_hours"
                                    type="number"
                                    value={data.total_overtime_hours || 0}
                                    onChange={(e) =>
                                        setData(
                                            "total_overtime_hours",
                                            parseInt(e.target.value) || 0
                                        )
                                    }
                                    placeholder="Masukkan total jam lembur"
                                    className={
                                        errors.total_overtime_hours
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.total_overtime_hours && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.total_overtime_hours}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="basic_salary"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Gaji Pokok{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="basic_salary"
                                    type="number"
                                    value={data.basic_salary}
                                    onChange={(e) =>
                                        setData(
                                            "basic_salary",
                                            parseInt(e.target.value) || 0
                                        )
                                    }
                                    placeholder="Masukkan gaji pokok"
                                    className={
                                        errors.basic_salary
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.basic_salary && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.basic_salary}
                                    </p>
                                )}
                                <p className="text-sm text-gray-500 mt-1">
                                    {floatToIdCurrency(data.basic_salary)}
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="overtime_salary"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Gaji Lembur{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="overtime_salary"
                                    type="number"
                                    value={data.overtime_salary}
                                    onChange={(e) =>
                                        setData(
                                            "overtime_salary",
                                            parseInt(e.target.value) || 0
                                        )
                                    }
                                    placeholder="Masukkan gaji lembur"
                                    className={
                                        errors.overtime_salary
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.overtime_salary && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.overtime_salary}
                                    </p>
                                )}
                                <p className="text-sm text-gray-500 mt-1">
                                    {floatToIdCurrency(data.overtime_salary)}
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="net_salary"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Gaji Bersih{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="net_salary"
                                    type="number"
                                    value={data.net_salary}
                                    onChange={(e) =>
                                        setData(
                                            "net_salary",
                                            parseInt(e.target.value) || 0
                                        )
                                    }
                                    placeholder="Masukkan gaji bersih"
                                    className={
                                        errors.net_salary
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.net_salary && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.net_salary}
                                    </p>
                                )}
                                <p className="text-sm text-gray-500 mt-1">
                                    {floatToIdCurrency(data.net_salary)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Deductions Information Card - placed between salary and bonus (selectable type, amount readonly) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Edit className="text-slate-400" />
                                Edit Potongan
                            </div>
                            <Button
                                type="button"
                                onClick={addDeduction}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Potongan
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!data.deductions || data.deductions.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                                Tidak ada potongan yang diterapkan
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {(data.deductions as DeductionEdit[]).map(
                                    (ded, index) => (
                                        <div
                                            key={`${ded.deduction_id ?? index}`}
                                            className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg"
                                        >
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Jenis Potongan
                                                </label>
                                                <SelectSearchInput
                                                    value={String(
                                                        ded.deduction_id ?? ""
                                                    )}
                                                    options={deductions_list}
                                                    onChange={(val) =>
                                                        onChangeDeduction(
                                                            index,
                                                            val
                                                        )
                                                    }
                                                    placeholder="Pilih jenis potongan"
                                                    className="bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Jumlah Potongan
                                                </label>
                                                <Input
                                                    type="number"
                                                    value={ded.amount}
                                                    readOnly
                                                    placeholder="Masukkan jumlah potongan"
                                                />
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {floatToIdCurrency(
                                                        ded.amount
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-end">
                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        removeDeduction(index)
                                                    }
                                                    variant="destructive"
                                                    size="sm"
                                                    className="flex items-center gap-2"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Hapus
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bonus Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Edit className="text-slate-400" />
                                Edit Bonus
                            </div>
                            <Button
                                type="button"
                                onClick={addBonus}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Bonus
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.bonuses.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                                Tidak ada bonus yang ditambahkan
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {data.bonuses.map((bonus, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg"
                                    >
                                        <div>
                                            <label
                                                htmlFor={`bonus_type_${index}`}
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                            >
                                                Jenis Bonus
                                            </label>
                                            <Input
                                                id={`bonus_type_${index}`}
                                                value={bonus.bonus_type}
                                                onChange={(e) =>
                                                    updateBonus(
                                                        index,
                                                        "bonus_type",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Masukkan jenis bonus"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                htmlFor={`bonus_amount_${index}`}
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                            >
                                                Jumlah Bonus
                                            </label>
                                            <Input
                                                id={`bonus_amount_${index}`}
                                                type="number"
                                                value={bonus.amount}
                                                onChange={(e) =>
                                                    updateBonus(
                                                        index,
                                                        "amount",
                                                        parseInt(
                                                            e.target.value
                                                        ) || 0
                                                    )
                                                }
                                                placeholder="Masukkan jumlah bonus"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                {floatToIdCurrency(
                                                    bonus.amount
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-end">
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    removeBonus(index)
                                                }
                                                variant="destructive"
                                                size="sm"
                                                className="flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Hapus
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <ConfirmDialog
                        title="Konfirmasi Update"
                        description="Apakah Anda yakin ingin mengupdate slip gaji ini? Perubahan akan tersimpan permanen."
                        type="danger"
                        confirmAction={() => {
                            const event = {
                                preventDefault: () => {},
                            } as React.FormEvent;
                            handleSubmit(event);
                        }}
                        triggerNode={
                            <Button
                                type="button"
                                variant={"red"}
                                disabled={processing}
                                className="flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {processing
                                    ? "Menyimpan..."
                                    : "Simpan Perubahan"}
                            </Button>
                        }
                    />
                </div>
            </form>
        </AppLayout>
    );
};

export default SalarySlipEdit;
