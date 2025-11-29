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
import {
    InstalmentEditProps,
    InstalmentFormData,
    InstalmentPaymentFormData,
} from "@/types/instalment";
import { useForm } from "@inertiajs/react";
import { Lightbulb, Loader, Plus, Save, Trash2 } from "lucide-react";
import React, { useEffect } from "react";

const InstalmentEdit = ({
    title,
    description,
    instalment,
    employees,
}: InstalmentEditProps) => {
    const { data, setData, put, processing, errors, clearErrors, setError } =
        useForm<InstalmentFormData>({
            employee_id: instalment.employee_id,
            total_amount: instalment.total_amount,
            instalment_value: instalment.instalment_value,
            direct_instalment_payments: (instalment.payments || [])
                .map((p) => ({
                    id: p.id,
                    payment_value: p.payment_value,
                    paid_at: p.paid_at,
                    payment_source: p.payment_source,
                    instalment_id: p.instalment_id,
                })),
        });

    const addInstalmentPayment = () => {
        const newPayment: InstalmentPaymentFormData = {
            payment_value: data.instalment_value,
            paid_at: undefined,
            payment_source: "direct",
        };
        setData("direct_instalment_payments", [
            ...(data.direct_instalment_payments || []),
            newPayment,
        ]);
    };

    const removeInstalmentPayment = (index: number) => {
        const next = (data.direct_instalment_payments || []).filter(
            (_, i) => i !== index
        );
        setData("direct_instalment_payments", next);
    };

    const setPaymentField = (
        index: number,
        field: keyof InstalmentPaymentFormData,
        value: InstalmentPaymentFormData[keyof InstalmentPaymentFormData]
    ) => {
        const list = [...(data.direct_instalment_payments || [])];
        list[index] = {
            ...list[index],
            [field]: value,
        } as InstalmentPaymentFormData;
        setData("direct_instalment_payments", list);
    };

    const getError = (path: string): string | null =>
        (errors as unknown as Record<string, string | undefined>)?.[path] ??
        null;

    const validateForm = (): boolean => {
        clearErrors();
        let valid = true;

        if (!data.employee_id) {
            setError("employee_id", "Karyawan wajib dipilih");
            valid = false;
        }
        if (
            !data.total_amount ||
            isNaN(Number(data.total_amount)) ||
            Number(data.total_amount) <= 0
        ) {
            setError(
                "total_amount",
                "Total angsuran wajib diisi dan lebih dari 0"
            );
            valid = false;
        }
        if (
            !data.instalment_value ||
            isNaN(Number(data.instalment_value)) ||
            Number(data.instalment_value) <= 0
        ) {
            setError(
                "instalment_value",
                "Nilai cicilan wajib diisi dan lebih dari 0"
            );
            valid = false;
        }

        if (
            data.direct_instalment_payments &&
            data.direct_instalment_payments.length > 0
        ) {
            data.direct_instalment_payments.forEach((p, idx) => {
                if (
                    p.payment_value === undefined ||
                    p.payment_value === null ||
                    isNaN(Number(p.payment_value)) ||
                    Number(p.payment_value) <= 0
                ) {
                    setError(
                        `direct_instalment_payments.${idx}.payment_value`,
                        "Nominal pembayaran wajib diisi dan lebih dari 0"
                    );
                    valid = false;
                }
                if (!p.paid_at || String(p.paid_at).trim() === "") {
                    setError(
                        `direct_instalment_payments.${idx}.paid_at`,
                        "Tanggal pembayaran wajib diisi"
                    );
                    valid = false;
                }
            });
        }

        return valid;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;
        put(`/instalment/${instalment.id}`);
    };

    const allPaymentsAreDirect = (instalment.payments || []).every(
        (p) => p.payment_source !== "salary"
    );

    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            <form onSubmit={handleSubmit}>
                <div className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col w-full">
                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            Karyawan
                        </label>
                        <SelectSearchInput
                            value={data.employee_id?.toString() || ""}
                            onChange={(value) =>
                                setData("employee_id", Number(value))
                            }
                            placeholder="Pilih Karyawan"
                            options={employees}
                            removeValue={() =>
                                setData("employee_id", undefined)
                            }
                        />
                        {errors.employee_id && (
                            <ErrorInput error={errors.employee_id} />
                        )}
                    </div>
                    <div className="flex flex-col w-full">
                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            Total Angsuran (yang diambil)
                        </label>
                        <Input
                            type="number"
                            name="total_amount"
                            id="total_amount"
                            placeholder="Masukkan Total Angsuran"
                            value={data.total_amount ?? ""}
                            onChange={(e) =>
                                setData("total_amount", Number(e.target.value))
                            }
                            disabled={!allPaymentsAreDirect}
                            className={cn(
                                errors.total_amount && "border-red-500"
                            )}
                        />
                        {errors.total_amount && (
                            <ErrorInput error={errors.total_amount} />
                        )}
                    </div>
                    <div className="flex flex-col w-full">
                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            Nominal Angsuran per Periode
                        </label>
                        <Input
                            type="number"
                            name="instalment_value"
                            id="instalment_value"
                            placeholder="Masukkan Angsuran per Periode"
                            value={data.instalment_value ?? ""}
                            onChange={(e) => {
                                setData(
                                    "instalment_value",
                                    Number(e.target.value)
                                );
                                setData(
                                    "direct_instalment_payments",
                                    (data.direct_instalment_payments || []).map(
                                        (payment) => ({
                                            ...payment,
                                            payment_value: Number(
                                                e.target.value
                                            ),
                                        })
                                    )
                                );
                            }}
                            disabled={!allPaymentsAreDirect}
                            className={cn(
                                errors.instalment_value && "border-red-500"
                            )}
                        />
                        {errors.instalment_value && (
                            <ErrorInput error={errors.instalment_value} />
                        )}
                    </div>
                </div>

                <div className="flex flex-col">
                    <Button
                        type="button"
                        variant={"blue"}
                        size={"sm"}
                        className="w-fit mb-3"
                        onClick={addInstalmentPayment}
                        disabled={!allPaymentsAreDirect}
                    >
                        <Plus /> <span>Tambah Pembayaran</span>
                    </Button>
                    <div className="mb-5">
                        {data?.direct_instalment_payments &&
                        data?.direct_instalment_payments?.length > 0 ? (
                            data.direct_instalment_payments.map(
                                (payment, index) => {
                                    const isFromSalary = payment.payment_source === "salary";
                                    return (
                                        <div
                                            key={index}
                                            className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4"
                                        >
                                            <div className="flex flex-col w-full md:col-span-3">
                                                <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                    Nominal Pembayaran {isFromSalary && "(Dari Gaji)"}
                                                </label>
                                                <Input
                                                    type="number"
                                                    name={`direct_instalment_payments[${index}][payment_value]`}
                                                    placeholder="Masukkan Nominal Pembayaran"
                                                    value={
                                                        payment.payment_value ?? ""
                                                    }
                                                    onChange={(e) =>
                                                        setPaymentField(
                                                            index,
                                                            "payment_value",
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                    disabled={isFromSalary}
                                                    className={cn(
                                                        getError(
                                                            `direct_instalment_payments.${index}.payment_value`
                                                        ) && "border-red-500"
                                                    )}
                                                />
                                                {getError(
                                                    `direct_instalment_payments.${index}.payment_value`
                                                ) && (
                                                    <ErrorInput
                                                        error={getError(
                                                            `direct_instalment_payments.${index}.payment_value`
                                                        )}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-col w-full md:col-span-3">
                                                <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                    Tanggal Pembayaran {isFromSalary && "(Dari Gaji)"}
                                                </label>
                                                <DatePickerInput
                                                    value={payment.paid_at || ""}
                                                    onChange={(value) =>
                                                        setPaymentField(
                                                            index,
                                                            "paid_at",
                                                            value
                                                                ? String(value)
                                                                : undefined
                                                        )
                                                    }
                                                    mode="single"
                                                    placeholder="Pilih Tanggal Pembayaran"
                                                    disabled={isFromSalary}
                                                    className={cn(
                                                        getError(
                                                            `direct_instalment_payments.${index}.paid_at`
                                                        ) && "border-red-500"
                                                    )}
                                                />
                                                {getError(
                                                    `direct_instalment_payments.${index}.paid_at`
                                                ) && (
                                                    <ErrorInput
                                                        error={getError(
                                                            `direct_instalment_payments.${index}.paid_at`
                                                        )}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex items-end md:col-span-1">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    className="w-full"
                                                    onClick={() =>
                                                        removeInstalmentPayment(
                                                            index
                                                        )
                                                    }
                                                    disabled={isFromSalary}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                }
                            )
                        ) : (
                            <div className="flex text-sm items-center gap-2">
                                <Lightbulb className="text-yellow-500" />{" "}
                                <span>
                                    Untuk menambah pembayaran angsuran terdahulu
                                </span>{" "}
                            </div>
                        )}
                    </div>
                </div>
                <Button
                    type="submit"
                    className="w-full p-3 bg-green-500 hover:bg-green-600"
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

export default InstalmentEdit;
