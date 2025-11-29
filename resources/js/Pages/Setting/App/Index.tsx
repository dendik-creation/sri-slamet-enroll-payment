import { ErrorInput } from "@/Components/custom/FormElement";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { cn } from "@/lib/utils";
import AppLayout from "@/Partials/AppLayout";
import { PageTitle } from "@/Partials/PageTitle";
import { AppSetting, SettingIndexPropos } from "@/types/global";
import { useForm } from "@inertiajs/react";
import { Loader, Save } from "lucide-react";
import React from "react";

const SettingIndex = ({ title, description, setting }: SettingIndexPropos) => {
    const {
        data,
        setData,
        put,
        processing,
        errors,
        reset,
        clearErrors,
        setError,
    } = useForm({
        id: setting?.id ?? "",
        normal_work_hours: setting?.normal_work_hours ?? "",
        attendance_start: setting?.attendance_start ?? "",
        attendance_end: setting?.attendance_end ?? "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setData(name as keyof AppSetting, value);
    };

    const validateForm = (): boolean => {
        clearErrors();
        let valid = true;

        if (
            data.normal_work_hours === undefined ||
            data.normal_work_hours === null ||
            isNaN(Number(data.normal_work_hours))
        ) {
            setError("normal_work_hours", "Jam kerja normal wajib diisi");
            valid = false;
        }
        if (
            data.attendance_start === undefined ||
            data.attendance_start === null ||
            data.attendance_start === ""
        ) {
            setError("attendance_start", "Batas masuk wajib diisi");
            valid = false;
        }
        if (
            data.attendance_end === undefined ||
            data.attendance_end === null ||
            data.attendance_end === ""
        ) {
            setError("attendance_end", "Batas pulang wajib diisi");
            valid = false;
        }

        return valid;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;
        put("/setting/update", {
            onSuccess: () => {
                reset();
            },
        });
    };
    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            <form onSubmit={handleSubmit}>
                <div className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col w-full">
                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            Normal jam kerja karyawan
                        </label>
                        <Input
                            type="number"
                            name="normal_work_hours"
                            id="normal_work_hours"
                            placeholder="Masukkan jam kerja normal"
                            value={data.normal_work_hours ?? ""}
                            onChange={handleChange}
                            className={cn(
                                errors.normal_work_hours && "border-red-500"
                            )}
                        />
                        {errors.normal_work_hours && (
                            <ErrorInput error={errors.normal_work_hours} />
                        )}
                    </div>
                    <div className="flex flex-col w-full">
                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            Jam masuk kerja
                        </label>
                        <Input
                            type="time"
                            name="attendance_start"
                            id="attendance_start"
                            placeholder="Masukkan jam masuk kerja"
                            value={data.attendance_start ?? ""}
                            onChange={handleChange}
                            className={cn(
                                errors.attendance_start && "border-red-500"
                            )}
                        />
                        {errors.attendance_start && (
                            <ErrorInput error={errors.attendance_start} />
                        )}
                    </div>
                    <div className="flex flex-col w-full">
                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                            Jam pulang kerja
                        </label>
                        <Input
                            type="time"
                            name="attendance_end"
                            id="attendance_end"
                            placeholder="Masukkan jam pulang kerja"
                            value={data.attendance_end ?? ""}
                            onChange={handleChange}
                            className={cn(
                                errors.attendance_end && "border-red-500"
                            )}
                        />
                        {errors.attendance_end && (
                            <ErrorInput error={errors.attendance_end} />
                        )}
                    </div>
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
                            <span>Simpan</span>
                        </span>
                    )}
                </Button>
            </form>
        </AppLayout>
    );
};

export default SettingIndex;
