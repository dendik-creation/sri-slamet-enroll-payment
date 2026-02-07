import AppLayout from "@/Partials/AppLayout";
import { PageTitle } from "@/Partials/PageTitle";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    Loader,
    Pencil,
    Plus,
    Save,
    SearchXIcon,
    TrashIcon,
    Upload,
} from "lucide-react";
import { inputDebounce, ymdToIdDate } from "@/Components/helper/helper";
import { Button } from "@/Components/ui/button";
import { router, useForm } from "@inertiajs/react";
import {
    DatePickerInput,
    ErrorInput,
    PaginatorBuilder,
    SearchInput,
    SelectSearchInput,
} from "@/Components/custom/FormElement";
import { FormEvent, useEffect, useState } from "react";
import { Attendance, AttendanceIndexProps } from "@/types/atttendance";
import ModalImport from "@/Components/custom/ModalImport";
import BlastToaster from "@/Components/custom/BlastToaster";
import {
    Dialog,
    DialogHeader,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import ConfirmDialog from "@/Components/custom/ConfirmDialog";
import { SelectOption } from "@/types/global";

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

const AttendanceIndex = ({
    title,
    description,
    filter,
    attendances,
    employees,
}: AttendanceIndexProps) => {
    const [filterData, setFilterData] = useState({
        period_start: filter.period_start || "",
        period_end: filter.period_end || "",
        search: filter.search || "",
        employee_type: filter.employee_type || "",
    });

    const {
        data: importData,
        setData: setImportData,
        processing: isImporting,
        post: postImport,
    } = useForm({
        xlsx_file: null as File | null,
        openDialog: false as boolean,
    });

    const {
        data: formData,
        setData: setFormData,
        processing: formProcessing,
        post: formPost,
        put: formPut,
        errors: formErrors,
        setError: setFormError,
        reset: formReset,
        clearErrors: formClearErr,
    } = useForm({
        employee_id: null as number | null,
        month: null as string | null,
        year: new Date().getFullYear().toString(),
        employee_type: null as string | null,
        period_start: filter.period_start || (null as string | null),
        period_end: filter.period_end || (null as string | null),
        work_days: null as number | null,
        overtime: null as number | null,
        mode: "add" as "add" | "edit",
    });

    const { delete: deleteAttendance, processing: isDeleting } = useForm();

    const handleFormChange = (field: keyof typeof formData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (field == "employee_id") {
            const selectedEmployee = employees.find(
                (emp) => emp.value == value.toString(),
            );
            if (selectedEmployee) {
                setFormData((prev) => ({
                    ...prev,
                    employee_type:
                        selectedEmployee.other_info?.salary_type || null,
                }));
            } else {
                setFormData((prev) => ({ ...prev, employee_type: null }));
            }
        }
    };

    useEffect(() => {
        if (formData.month && formData.year) {
            const { period_start, period_end, work_days } =
                convertMonthYearToDateRange(formData.month, formData.year);
            setFormData((prev) => ({
                ...prev,
                period_start,
                period_end,
                work_days,
            }));
        }
    }, [formData.month, formData.year]);

    const convertMonthYearToDateRange = (month: string, year: string) => {
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);

        const period_start = `${year}-${month.padStart(2, "0")}-01`;

        const lastDay = new Date(yearNum, monthNum, 0).getDate();
        const period_end = `${year}-${month.padStart(2, "0")}-${lastDay.toString().padStart(2, "0")}`;
        const work_days = lastDay;
        return { period_start, period_end, work_days };
    };

    const debouncedFilter = inputDebounce(
        (
            search: string,
            period_start: string,
            period_end: string,
            employee_type: string | null,
        ) => {
            router.get(
                "/attendance",
                { search, period_start, period_end, employee_type },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        },
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFilterData((prev) => {
            const newData = { ...prev, search: value };
            debouncedFilter(
                newData.search,
                newData.period_start,
                newData.period_end,
                newData.employee_type,
            );
            return newData;
        });
    };

    const handleEmployeeType = (value: string) => {
        setFilterData((prev) => {
            const newData = { ...prev, employee_type: value };
            debouncedFilter(
                newData.search,
                newData.period_start,
                newData.period_end,
                newData.employee_type,
            );
            return newData;
        });
    };

    const handleDate = (period_start: string, period_end: string) => {
        setFilterData((prev) => {
            const newData = { ...prev, period_start, period_end };
            debouncedFilter(
                newData.search,
                newData.period_start,
                newData.period_end,
                newData.employee_type,
            );
            return newData;
        });
    };

    const handleImport = (e: FormEvent) => {
        e.preventDefault();
        if (!importData.xlsx_file) return;
        postImport(`/import/attendance`, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            preserveScroll: true,
            replace: true,
            onError: (error: any) => {
                BlastToaster("error", error.message || "Gagal mengimpor data");
            },
            onFinish: () => {
                setImportData("xlsx_file", null);
                setImportData("openDialog", false);
            },
        });
    };

    const getEmployeeSalaryType = (employee_id: number): string | null => {
        const employee = employees.find(
            (emp) => emp.value == employee_id.toString(),
        );
        if (
            employee &&
            employee.other_info &&
            employee.other_info.salary_type
        ) {
            return employee.other_info.salary_type;
        }
        return null;
    };

    const validateFormSubmit = (): boolean => {
        formClearErr();
        let isValid = true;
        if (!formData.employee_id) {
            setFormError("employee_id", "Karyawan harus dipilih");
            isValid = false;
        }
        if (!formData.period_start) {
            setFormError("period_start", "Tanggal mulai harus dipilih");
            isValid = false;
        }
        if (!formData.period_end) {
            setFormError("period_end", "Tanggal selesai harus dipilih");
            isValid = false;
        }
        if (!formData.work_days) {
            setFormError("work_days", "Jumlah hari kerja harus diisi");
            isValid = false;
        }
        if (
            getEmployeeSalaryType(formData.employee_id!) === "daily" &&
            Number(formData.work_days) > 7
        ) {
            setFormError(
                "work_days",
                "Jumlah hari kerja tidak boleh lebih dari 7",
            );
            isValid = false;
        }
        if (
            getEmployeeSalaryType(formData.employee_id!) === "monthly" &&
            Number(formData.work_days) > 31
        ) {
            setFormError(
                "work_days",
                "Jumlah hari kerja tidak boleh lebih dari 31",
            );
            isValid = false;
        }
        if (
            getEmployeeSalaryType(formData.employee_id!) === "monthly" &&
            (formData.month == null || formData.month == "")
        ) {
            setFormError("month", "Bulan harus dipilih");
            isValid = false;
        }
        if (
            getEmployeeSalaryType(formData.employee_id!) === "monthly" &&
            (formData.year == null || formData.year == "")
        ) {
            setFormError("year", "Tahun harus dipilih");
            isValid = false;
        }
        if (formData.overtime !== null && Number(formData.overtime) > 9.9) {
            setFormError(
                "overtime",
                "Jumlah lembur tidak boleh lebih dari 9.9 jam",
            );
            isValid = false;
        }
        return isValid; // Return the validity status
    };

    const handleEditMode = (att: Attendance) => {
        const periodStartDate = new Date(att.period_start);
        const month = (periodStartDate.getMonth() + 1).toString();
        const year = periodStartDate.getFullYear().toString();

        setFormData({
            employee_id: att.employee.id,
            period_start: att.period_start,
            period_end: att.period_end,
            month: month,
            year: year,
            employee_type: getEmployeeSalaryType(att.employee.id),
            work_days: att.work_days,
            overtime: att.overtime,
            mode: "edit",
        });
    };

    const handleFormSubmit = (e: FormEvent, attendance_id?: number) => {
        e.preventDefault();
        if (!validateFormSubmit()) return;
        if (formData.mode === "add") {
            formPost(`/attendance`, {
                preserveScroll: true,
                replace: true,
                onSuccess: () => formReset(),
            });
        } else {
            formPut(`/attendance/${attendance_id}`, {
                preserveScroll: true,
                replace: true,
                onSuccess: () => formReset(),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (isDeleting) return;
        deleteAttendance(`/attendance/${id}`, {
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            <div className="flex lg:flex-row flex-col lg:gap-0 gap-3 items-start lg:items-center justify-between mb-4">
                <div className="flex-1 flex items-center gap-3 relative w-full">
                    <SearchInput
                        placeholder={`Cari berdasarkan NIP atau nama karyawan`}
                        className="lg:max-w-sm w-full"
                        onChange={handleSearch}
                        value={filterData.search || ""}
                    />
                    <div className="">
                        <SelectSearchInput
                            value={filterData.employee_type}
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
                                handleEmployeeType(value.toString())
                            }
                            removeValue={() => handleEmployeeType("")}
                        />
                    </div>
                    <DatePickerInput
                        disabled={
                            formProcessing ||
                            isImporting ||
                            isDeleting ||
                            filterData.employee_type == "monthly"
                        }
                        className="w-fit"
                        value={
                            filterData.period_start && filterData.period_end
                                ? {
                                      from: new Date(filterData.period_start),
                                      to: new Date(filterData.period_end),
                                  }
                                : undefined
                        }
                        placeholder="Pilih rentang tanggal"
                        mode="range"
                        onChange={(dateRange) => {
                            if (dateRange && typeof dateRange === "string") {
                                const [start, end] = dateRange.split(" - ");
                                handleDate(
                                    start?.trim() || "",
                                    end?.trim() || "",
                                );
                            } else {
                                handleDate("", "");
                            }
                        }}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <ModalImport
                        description="Silakan download contoh file untuk mengisi data absensi karyawan"
                        isImporting={isImporting}
                        file={importData.xlsx_file}
                        onFileChange={(file: File | null) =>
                            setImportData("xlsx_file", file)
                        }
                        onSubmit={handleImport}
                        exampleFile="/assets/xlsx-format/import-absensi.xlsx"
                        title="Import Absensi Karyawan"
                        triggerNode={
                            <Button
                                variant={"yellow"}
                                className="cursor-pointer"
                            >
                                <Upload />
                                <span>Import Kehadiran</span>
                            </Button>
                        }
                        open={importData.openDialog}
                        onOpenChange={(open: boolean) =>
                            setImportData("openDialog", open)
                        }
                    />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant={"blue"}
                                type="button"
                                className="cursor-pointer"
                                onClick={() => formReset()}
                            >
                                <Plus />
                                <span>Tambah Kehadiran</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-5xl">
                            <form onSubmit={handleFormSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Tambah Kehadiran</DialogTitle>
                                    <DialogDescription>
                                        Silakan isi data kehadiran karyawan
                                    </DialogDescription>

                                    <div className="flex flex-col gap-3">
                                        <div className="grid lg:grid-cols-2 grid-cols-1 gap-3 mt-4">
                                            <div className="flex flex-col w-full">
                                                <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                    Pilih Karyawan
                                                </label>
                                                <SelectSearchInput
                                                    value={
                                                        formData.employee_id?.toString() ||
                                                        ""
                                                    }
                                                    options={employees}
                                                    placeholder="Pilih karyawan"
                                                    onChange={(value) =>
                                                        handleFormChange(
                                                            "employee_id",
                                                            value.toString(),
                                                        )
                                                    }
                                                    removeValue={() =>
                                                        handleFormChange(
                                                            "employee_id",
                                                            "",
                                                        )
                                                    }
                                                />
                                                {formErrors.employee_id && (
                                                    <ErrorInput
                                                        error={
                                                            formErrors.employee_id
                                                        }
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-col w-full">
                                                <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                    {formData.employee_type ==
                                                    "monthly"
                                                        ? "Bulan dan Tahun Kehadiran"
                                                        : "Rentang Tanggal Kehadiran"}
                                                </label>
                                                {formData.employee_type ==
                                                    "daily" ||
                                                formData.employee_type ==
                                                    null ? (
                                                    <div className="">
                                                        <DatePickerInput
                                                            className=""
                                                            value={
                                                                formData.period_start &&
                                                                formData.period_end
                                                                    ? {
                                                                          from: new Date(
                                                                              formData.period_start,
                                                                          ),
                                                                          to: new Date(
                                                                              formData.period_end,
                                                                          ),
                                                                      }
                                                                    : undefined
                                                            }
                                                            placeholder="Pilih rentang tanggal"
                                                            mode="range"
                                                            onChange={(
                                                                dateRange,
                                                            ) => {
                                                                if (
                                                                    dateRange &&
                                                                    typeof dateRange ===
                                                                        "string"
                                                                ) {
                                                                    const [
                                                                        start,
                                                                        end,
                                                                    ] =
                                                                        dateRange.split(
                                                                            " - ",
                                                                        );
                                                                    handleFormChange(
                                                                        "period_start",
                                                                        start?.trim() ||
                                                                            null,
                                                                    );
                                                                    handleFormChange(
                                                                        "period_end",
                                                                        end?.trim() ||
                                                                            null,
                                                                    );
                                                                } else {
                                                                    handleFormChange(
                                                                        "period_start",
                                                                        null,
                                                                    );
                                                                    handleFormChange(
                                                                        "period_end",
                                                                        null,
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        {formErrors.period_start &&
                                                            formErrors.period_end && (
                                                                <ErrorInput
                                                                    error={
                                                                        "Rentang Tanggal Wajib Diisi"
                                                                    }
                                                                />
                                                            )}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-full">
                                                            <SelectSearchInput
                                                                value={
                                                                    formData.month ||
                                                                    ""
                                                                }
                                                                options={months}
                                                                placeholder="Pilih bulan"
                                                                onChange={(
                                                                    value,
                                                                ) =>
                                                                    handleFormChange(
                                                                        "month",
                                                                        value.toString(),
                                                                    )
                                                                }
                                                                removeValue={() =>
                                                                    handleFormChange(
                                                                        "month",
                                                                        "",
                                                                    )
                                                                }
                                                            />
                                                            {formErrors.month && (
                                                                <ErrorInput
                                                                    error={
                                                                        "Bulan wajib diisi"
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="w-full">
                                                            <SelectSearchInput
                                                                value={
                                                                    formData.year ||
                                                                    ""
                                                                }
                                                                options={Array.from(
                                                                    {
                                                                        length: 11,
                                                                    },
                                                                    (_, i) => {
                                                                        const yr =
                                                                            new Date().getFullYear() -
                                                                            5 +
                                                                            i;
                                                                        return {
                                                                            label: yr.toString(),
                                                                            value: yr.toString(),
                                                                        };
                                                                    },
                                                                )}
                                                                onChange={(
                                                                    value,
                                                                ) => {
                                                                    handleFormChange(
                                                                        "year",
                                                                        value.toString(),
                                                                    );
                                                                }}
                                                            />
                                                            {formErrors.year && (
                                                                <ErrorInput
                                                                    error={
                                                                        "Tahun wajib diisi"
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col w-full">
                                                <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                    Total Hari Kerja
                                                </label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step={0.5}
                                                    placeholder="Masukkan total hari kerja"
                                                    value={
                                                        formData.work_days || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleFormChange(
                                                            "work_days",
                                                            e.target.value
                                                                ? parseFloat(
                                                                      e.target
                                                                          .value,
                                                                  )
                                                                : null,
                                                        )
                                                    }
                                                />
                                                {formErrors.work_days && (
                                                    <ErrorInput
                                                        error={
                                                            formErrors.work_days
                                                        }
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-col w-full">
                                                <label className="text-base mb-1 ">
                                                    Total Lembur Kerja (Jam)
                                                </label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    step={0.5}
                                                    placeholder="Kosongkan jika tidak ada lembur"
                                                    value={
                                                        formData.overtime || ""
                                                    }
                                                    onChange={(e) =>
                                                        handleFormChange(
                                                            "overtime",
                                                            e.target.value
                                                                ? parseFloat(
                                                                      e.target
                                                                          .value,
                                                                  )
                                                                : null,
                                                        )
                                                    }
                                                />
                                                {formErrors.overtime && (
                                                    <ErrorInput
                                                        error={
                                                            formErrors.overtime
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        type="submit"
                                        variant={"blue"}
                                        className="w-full mt-4 p-3"
                                        disabled={formProcessing}
                                    >
                                        {formProcessing ? (
                                            <Loader className="animate-spin" />
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save />
                                                <span>Simpan</span>
                                            </span>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="rounded-md border">
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
                                Nama
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Tipe Gaji
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Rentang Tanggal
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Total kerja (hari)
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Total lembur (jam)
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attendances.data.length ? (
                            attendances.data.map(
                                (att: Attendance, idx: number) => (
                                    <TableRow key={att.id}>
                                        <TableCell>
                                            {idx +
                                                1 +
                                                attendances.per_page *
                                                    (attendances.current_page -
                                                        1)}
                                        </TableCell>
                                        <TableCell>
                                            {att.employee.nip}
                                        </TableCell>
                                        <TableCell>
                                            {att.employee.name}
                                        </TableCell>
                                        <TableCell>
                                            {att.employee.salary_type ==
                                            "monthly"
                                                ? "Bulanan"
                                                : "Harian"}
                                        </TableCell>
                                        <TableCell>
                                            {att.period_start
                                                ? ymdToIdDate(att.period_start)
                                                : "-"}
                                            {" - "}
                                            {att.period_end
                                                ? ymdToIdDate(att.period_end)
                                                : "-"}
                                        </TableCell>
                                        <TableCell>{att.work_days}</TableCell>
                                        <TableCell>{att.overtime}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            size={"icon"}
                                                            variant={"blue"}
                                                            type="button"
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                                handleEditMode(
                                                                    att,
                                                                )
                                                            }
                                                        >
                                                            <Pencil />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-5xl">
                                                        <form
                                                            onSubmit={(e) =>
                                                                handleFormSubmit(
                                                                    e,
                                                                    att.id,
                                                                )
                                                            }
                                                        >
                                                            <DialogHeader>
                                                                <DialogTitle>
                                                                    Edit
                                                                    Kehadiran
                                                                </DialogTitle>
                                                                <DialogDescription>
                                                                    Silakan
                                                                    perbarui
                                                                    data
                                                                    kehadiran
                                                                    karyawan
                                                                </DialogDescription>

                                                                <div className="flex flex-col gap-3">
                                                                    <div className="grid lg:grid-cols-2 grid-cols-1 gap-3 mt-4">
                                                                        <div className="flex flex-col w-full">
                                                                            <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                                                Pilih
                                                                                Karyawan
                                                                            </label>
                                                                            <SelectSearchInput
                                                                                value={
                                                                                    formData.employee_id?.toString() ||
                                                                                    ""
                                                                                }
                                                                                options={
                                                                                    employees
                                                                                }
                                                                                placeholder="Pilih karyawan"
                                                                                onChange={(
                                                                                    value,
                                                                                ) =>
                                                                                    handleFormChange(
                                                                                        "employee_id",
                                                                                        value.toString(),
                                                                                    )
                                                                                }
                                                                                removeValue={() =>
                                                                                    handleFormChange(
                                                                                        "employee_id",
                                                                                        "",
                                                                                    )
                                                                                }
                                                                            />
                                                                            {formErrors.employee_id && (
                                                                                <ErrorInput
                                                                                    error={
                                                                                        formErrors.employee_id
                                                                                    }
                                                                                />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-col w-full">
                                                                            <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                                                {formData.employee_type ==
                                                                                "monthly"
                                                                                    ? "Bulan dan Tahun Kehadiran"
                                                                                    : "Rentang Tanggal Kehadiran"}
                                                                            </label>
                                                                            {formData.employee_type ==
                                                                                "daily" ||
                                                                            formData.employee_type ==
                                                                                null ? (
                                                                                <div className="">
                                                                                    <DatePickerInput
                                                                                        className=""
                                                                                        value={
                                                                                            formData.period_start &&
                                                                                            formData.period_end
                                                                                                ? {
                                                                                                      from: new Date(
                                                                                                          formData.period_start,
                                                                                                      ),
                                                                                                      to: new Date(
                                                                                                          formData.period_end,
                                                                                                      ),
                                                                                                  }
                                                                                                : undefined
                                                                                        }
                                                                                        placeholder="Pilih rentang tanggal"
                                                                                        mode="range"
                                                                                        onChange={(
                                                                                            dateRange,
                                                                                        ) => {
                                                                                            if (
                                                                                                dateRange &&
                                                                                                typeof dateRange ===
                                                                                                    "string"
                                                                                            ) {
                                                                                                const [
                                                                                                    start,
                                                                                                    end,
                                                                                                ] =
                                                                                                    dateRange.split(
                                                                                                        " - ",
                                                                                                    );
                                                                                                handleFormChange(
                                                                                                    "period_start",
                                                                                                    start?.trim() ||
                                                                                                        null,
                                                                                                );
                                                                                                handleFormChange(
                                                                                                    "period_end",
                                                                                                    end?.trim() ||
                                                                                                        null,
                                                                                                );
                                                                                            } else {
                                                                                                handleFormChange(
                                                                                                    "period_start",
                                                                                                    null,
                                                                                                );
                                                                                                handleFormChange(
                                                                                                    "period_end",
                                                                                                    null,
                                                                                                );
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                    {formErrors.period_start &&
                                                                                        formErrors.period_end && (
                                                                                            <ErrorInput
                                                                                                error={
                                                                                                    "Rentang Tanggal Wajib Diisi"
                                                                                                }
                                                                                            />
                                                                                        )}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-full">
                                                                                        <SelectSearchInput
                                                                                            value={
                                                                                                formData.month ||
                                                                                                ""
                                                                                            }
                                                                                            options={
                                                                                                months
                                                                                            }
                                                                                            placeholder="Pilih bulan"
                                                                                            onChange={(
                                                                                                value,
                                                                                            ) =>
                                                                                                handleFormChange(
                                                                                                    "month",
                                                                                                    value.toString(),
                                                                                                )
                                                                                            }
                                                                                            removeValue={() =>
                                                                                                handleFormChange(
                                                                                                    "month",
                                                                                                    "",
                                                                                                )
                                                                                            }
                                                                                        />
                                                                                        {formErrors.month && (
                                                                                            <ErrorInput
                                                                                                error={
                                                                                                    "Bulan wajib diisi"
                                                                                                }
                                                                                            />
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="w-full">
                                                                                        <SelectSearchInput
                                                                                            value={
                                                                                                formData.year ||
                                                                                                ""
                                                                                            }
                                                                                            options={Array.from(
                                                                                                {
                                                                                                    length: 11,
                                                                                                },
                                                                                                (
                                                                                                    _,
                                                                                                    i,
                                                                                                ) => {
                                                                                                    const yr =
                                                                                                        new Date().getFullYear() -
                                                                                                        5 +
                                                                                                        i;
                                                                                                    return {
                                                                                                        label: yr.toString(),
                                                                                                        value: yr.toString(),
                                                                                                    };
                                                                                                },
                                                                                            )}
                                                                                            onChange={(
                                                                                                value,
                                                                                            ) => {
                                                                                                handleFormChange(
                                                                                                    "year",
                                                                                                    value.toString(),
                                                                                                );
                                                                                            }}
                                                                                        />
                                                                                        {formErrors.year && (
                                                                                            <ErrorInput
                                                                                                error={
                                                                                                    "Tahun wajib diisi"
                                                                                                }
                                                                                            />
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-col w-full">
                                                                            <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                                                Total
                                                                                Hari
                                                                                Kerja
                                                                            </label>
                                                                            <Input
                                                                                type="number"
                                                                                min={
                                                                                    0
                                                                                }
                                                                                step={
                                                                                    0.5
                                                                                }
                                                                                placeholder="Masukkan total hari kerja"
                                                                                value={
                                                                                    formData.work_days ||
                                                                                    ""
                                                                                }
                                                                                onChange={(
                                                                                    e,
                                                                                ) =>
                                                                                    handleFormChange(
                                                                                        "work_days",
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                            ? parseFloat(
                                                                                                  e
                                                                                                      .target
                                                                                                      .value,
                                                                                              )
                                                                                            : null,
                                                                                    )
                                                                                }
                                                                            />
                                                                            {formErrors.work_days && (
                                                                                <ErrorInput
                                                                                    error={
                                                                                        formErrors.work_days
                                                                                    }
                                                                                />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-col w-full">
                                                                            <label className="text-base mb-1 ">
                                                                                Total
                                                                                Lembur
                                                                                Kerja
                                                                                (Jam)
                                                                            </label>
                                                                            <Input
                                                                                type="number"
                                                                                min={
                                                                                    0
                                                                                }
                                                                                step={
                                                                                    0.5
                                                                                }
                                                                                placeholder="Kosongkan jika tidak ada lembur"
                                                                                value={
                                                                                    formData.overtime ||
                                                                                    ""
                                                                                }
                                                                                onChange={(
                                                                                    e,
                                                                                ) =>
                                                                                    handleFormChange(
                                                                                        "overtime",
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                            ? parseFloat(
                                                                                                  e
                                                                                                      .target
                                                                                                      .value,
                                                                                              )
                                                                                            : null,
                                                                                    )
                                                                                }
                                                                            />
                                                                            {formErrors.overtime && (
                                                                                <ErrorInput
                                                                                    error={
                                                                                        formErrors.overtime
                                                                                    }
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </DialogHeader>
                                                            <DialogFooter>
                                                                <Button
                                                                    type="submit"
                                                                    className="w-full mt-4 p-3 bg-amber-500 hover:bg-amber-600"
                                                                    disabled={
                                                                        formProcessing
                                                                    }
                                                                >
                                                                    {formProcessing ? (
                                                                        <Loader className="animate-spin" />
                                                                    ) : (
                                                                        <span className="flex items-center gap-2">
                                                                            <Save />
                                                                            <span>
                                                                                Simpan
                                                                            </span>
                                                                        </span>
                                                                    )}
                                                                </Button>
                                                            </DialogFooter>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>

                                                <ConfirmDialog
                                                    title="Hapus Kehadiran"
                                                    description="Apakah Anda yakin ingin menghapus kehadiran ini?"
                                                    type="danger"
                                                    confirmAction={() =>
                                                        handleDelete(att.id)
                                                    }
                                                    triggerNode={
                                                        <Button
                                                            variant="red"
                                                            size="icon"
                                                            disabled={
                                                                isDeleting
                                                            }
                                                        >
                                                            <TrashIcon />
                                                        </Button>
                                                    }
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ),
                            )
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-24 text-center"
                                >
                                    <div className="w-full flex flex-col items-center justify-center h-full gap-2">
                                        <SearchXIcon
                                            width={64}
                                            className="text-red-400"
                                        />
                                        <span>Data tidak ada</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {attendances.total > attendances.per_page && (
                <PaginatorBuilder
                    prevUrl={
                        attendances.prev_page_url +
                        "&" +
                        new URLSearchParams({
                            ...filter,
                            search: filter.search ?? "",
                            employee_type: filter.employee_type ?? "",
                        }).toString()
                    }
                    nextUrl={
                        attendances.next_page_url +
                        "&" +
                        new URLSearchParams({
                            ...filter,
                            search: filter.search ?? "",
                            employee_type: filter.employee_type ?? "",
                        }).toString()
                    }
                    currentPage={attendances.current_page}
                    totalPage={attendances.last_page}
                />
            )}
        </AppLayout>
    );
};

export default AttendanceIndex;
