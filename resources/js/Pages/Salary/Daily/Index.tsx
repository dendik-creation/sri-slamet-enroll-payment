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
import { Loader, Plus, Save, SearchXIcon, TrashIcon } from "lucide-react";
import { floatToIdCurrency, inputDebounce } from "@/Components/helper/helper";
import { Button } from "@/Components/ui/button";
import { router } from "@inertiajs/react";
import {
    DatePickerInput,
    MultiSelectSearchInput,
    PaginatorBuilder,
    SelectSearchInput,
} from "@/Components/custom/FormElement";
import { useState } from "react";
import { SalaryBonusFormProps, SalaryDailyIndexProps } from "@/types/salaries";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import BlastToaster from "@/Components/custom/BlastToaster";

const SalaryDailyIndex = ({
    title,
    description,
    salaries,
    start_date,
    end_date,
    expected_employees,
}: SalaryDailyIndexProps) => {
    const [filterData, setFilterData] = useState({
        start_date: start_date || "",
        end_date: end_date || "",
    });

    const [salaryDate, setSalaryDate] = useState<string>(
        new Date().toISOString().split("T")[0],
    );

    const [salaryBonusForm, setSalaryBonusForm] = useState<
        SalaryBonusFormProps[]
    >([
        {
            bonus_type: "",
            amount: undefined,
            target_employee: undefined,
            employee_id: [],
        },
    ]);

    const [onStoring, setOnStoring] = useState(false);

    const debouncedFilter = inputDebounce(
        (start_date: string, end_date: string) => {
            router.get(
                "/salary-daily",
                { start_date, end_date },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        },
    );

    const handleDate = (start_date: string, end_date: string) => {
        setFilterData((prev) => {
            const newData = { ...prev, start_date, end_date };
            debouncedFilter(newData.start_date, newData.end_date);
            return newData;
        });
    };

    const handleChangeBonus = (
        index: number,
        field: keyof SalaryBonusFormProps,
        value: any,
    ) => {
        setSalaryBonusForm((prev) => {
            const newForm = [...prev];
            (newForm[index][field] as typeof value) = value;
            return newForm;
        });
    };

    const addNewBonus = () => {
        setSalaryBonusForm((prev) => [
            ...prev,
            {
                bonus_type: "",
                amount: undefined,
                target_employee: undefined,
                employee_id: [],
            },
        ]);
    };

    const handleRemoveBonus = (index: number) => {
        setSalaryBonusForm((prev) => prev.filter((_, i) => i !== index));
    };

    const isInitialBonusForm = (form: SalaryBonusFormProps[]) => {
        return (
            form.length === 1 &&
            form[0].bonus_type === "" &&
            (form[0].amount === undefined || form[0].amount === null) &&
            form[0].target_employee === undefined &&
            (!form[0].employee_id || form[0].employee_id.length === 0)
        );
    };

    const validateBonusForm = () => {
        if (isInitialBonusForm(salaryBonusForm)) {
            return true;
        }

        for (let i = 0; i < salaryBonusForm.length; i++) {
            const bonus = salaryBonusForm[i];

            const isEmpty =
                !bonus.bonus_type &&
                (bonus.amount === undefined || bonus.amount === null) &&
                bonus.target_employee === undefined &&
                (!bonus.employee_id || bonus.employee_id.length === 0);

            if (isEmpty) continue;

            if (!bonus.bonus_type) {
                BlastToaster("error", "Nama bonus wajib diisi");
                return false;
            }
            if (bonus.amount === undefined || Number(bonus.amount) <= 0) {
                BlastToaster(
                    "error",
                    "Nominal bonus wajib diisi dan lebih dari 0",
                );
                return false;
            }
            if (!bonus.target_employee) {
                BlastToaster("error", "Target karyawan wajib dipilih");
                return false;
            }
            if (
                bonus.target_employee === "specific" &&
                (!bonus.employee_id || bonus.employee_id.length === 0)
            ) {
                BlastToaster(
                    "error",
                    "Pilih minimal satu karyawan untuk bonus tertentu",
                );
                return false;
            }
        }
        return true;
    };

    const handleStoreDaily = (with_print = false) => {
        if (!validateBonusForm()) return;
        setOnStoring(true);
        router.post(
            "/salary-daily/store",
            {
                with_print,
                start_date: filterData.start_date,
                end_date: filterData.end_date,
                bonuses: salaryBonusForm,
            },
            {
                preserveState: true,
                replace: true,
                onFinish: () => {
                    setSalaryBonusForm([
                        {
                            bonus_type: "",
                            amount: undefined,
                            target_employee: undefined,
                            employee_id: [],
                        },
                    ]);
                    setOnStoring(false);
                },
            },
        );
    };

    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            <div className="flex lg:flex-row flex-col lg:gap-0 gap-3 items-start lg:items-center justify-between mb-4">
                <div className="flex-1 justify-between flex items-center relative w-full">
                    <div className="w-full gap-3 flex items-center">
                        <span>Data ditampilkan untuk tanggal</span>
                        <DatePickerInput
                            className="w-fit"
                            value={
                                filterData.start_date && filterData.end_date
                                    ? {
                                          from: new Date(filterData.start_date),
                                          to: new Date(filterData.end_date),
                                      }
                                    : undefined
                            }
                            placeholder="Pilih rentang tanggal"
                            mode="range"
                            onChange={(dateRange) => {
                                if (
                                    dateRange &&
                                    typeof dateRange === "string"
                                ) {
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
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant={"green"}
                                disabled={
                                    onStoring || salaries.data.length === 0
                                }
                                className="flex items-center gap-2"
                            >
                                <span>Simpan Gaji</span>
                                {onStoring ? (
                                    <span className="animate-spin">
                                        <Loader />
                                    </span>
                                ) : (
                                    <Save />
                                )}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-7xl">
                            <DialogHeader>
                                <DialogTitle>Simpan Gaji Karyawan</DialogTitle>
                                <DialogDescription className="mb-3">
                                    Anda dapat menambahkan bonus untuk beberapa
                                    karyawan sekaligus (Opsional).
                                </DialogDescription>
                                <div className="flex flex-col gap-3">
                                    <div className="w-fit">
                                        <label className="mb-1">
                                            Tanggal Gaji Diberikan Karyawan
                                        </label>
                                        <div className="w-full">
                                            <DatePickerInput
                                                mode="single"
                                                placeholder="Pilih tanggal gajian"
                                                value={salaryDate}
                                                onChange={(value) =>
                                                    setSalaryDate(
                                                        value?.toString() || "",
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-start">
                                        <Button
                                            type="button"
                                            variant={"blue"}
                                            size={"sm"}
                                            onClick={addNewBonus}
                                        >
                                            <Plus />
                                            <span>Tambah Bonus</span>
                                        </Button>
                                    </div>
                                    {salaryBonusForm.length > 0 &&
                                        salaryBonusForm.map(
                                            (
                                                bonus: SalaryBonusFormProps,
                                                index: number,
                                            ) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-3 w-full"
                                                >
                                                    <div className="flex-1">
                                                        <Input
                                                            type="text"
                                                            placeholder="Nama bonus"
                                                            name={`bonus_type_${index}`}
                                                            id={`bonus_type_${index}`}
                                                            value={
                                                                bonus.bonus_type
                                                            }
                                                            onChange={(e) =>
                                                                handleChangeBonus(
                                                                    index,
                                                                    "bonus_type",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex-[0.8]">
                                                        <Input
                                                            type="number"
                                                            placeholder="Nominal bonus"
                                                            name={`bonus_amount_${index}`}
                                                            id={`bonus_amount_${index}`}
                                                            value={bonus.amount}
                                                            onChange={(e) =>
                                                                handleChangeBonus(
                                                                    index,
                                                                    "amount",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex-[1.2] h-9">
                                                        <SelectSearchInput
                                                            value={
                                                                bonus.target_employee as
                                                                    | "all"
                                                                    | "specific"
                                                            }
                                                            placeholder="Target karyawan"
                                                            options={[
                                                                {
                                                                    value: "all",
                                                                    label: "Semua Karyawan",
                                                                },
                                                                {
                                                                    value: "specific",
                                                                    label: "Karyawan Tertentu",
                                                                },
                                                            ]}
                                                            onChange={(value) =>
                                                                handleChangeBonus(
                                                                    index,
                                                                    "target_employee",
                                                                    value,
                                                                )
                                                            }
                                                            removeValue={() =>
                                                                handleChangeBonus(
                                                                    index,
                                                                    "target_employee",
                                                                    undefined,
                                                                )
                                                            }
                                                            className="h-9"
                                                        />
                                                    </div>
                                                    {bonus.target_employee ===
                                                        "specific" && (
                                                        <div className="flex-[2] min-h-9.5">
                                                            <MultiSelectSearchInput
                                                                values={
                                                                    bonus.employee_id?.map(
                                                                        (id) =>
                                                                            String(
                                                                                id,
                                                                            ),
                                                                    ) || []
                                                                }
                                                                placeholder="Pilih karyawan"
                                                                options={
                                                                    expected_employees
                                                                }
                                                                onChange={(
                                                                    values,
                                                                ) => {
                                                                    handleChangeBonus(
                                                                        index,
                                                                        "employee_id",
                                                                        values.map(
                                                                            (
                                                                                v,
                                                                            ) =>
                                                                                Number(
                                                                                    v,
                                                                                ),
                                                                        ),
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                    {index > 0 && (
                                                        <Button
                                                            type="button"
                                                            variant={"red"}
                                                            size={"icon"}
                                                            onClick={() =>
                                                                handleRemoveBonus(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            <span className="sr-only">
                                                                Hapus Bonus
                                                            </span>
                                                            <TrashIcon />
                                                        </Button>
                                                    )}
                                                </div>
                                            ),
                                        )}
                                </div>
                            </DialogHeader>
                            <DialogFooter className="mt-9">
                                <DialogClose asChild disabled={onStoring}>
                                    <Button
                                        type="button"
                                        disabled={onStoring}
                                        variant="outline"
                                    >
                                        Batalkan
                                    </Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    onClick={() => handleStoreDaily(false)}
                                    disabled={onStoring}
                                    variant={"yellow"}
                                >
                                    {onStoring ? (
                                        <Loader className="animate-spin" />
                                    ) : (
                                        <span>Simpan Saja</span>
                                    )}
                                </Button>
                                <Button
                                    type="submit"
                                    onClick={() => handleStoreDaily(true)}
                                    disabled={onStoring}
                                    variant={"green"}
                                >
                                    {onStoring ? (
                                        <Loader className="animate-spin" />
                                    ) : (
                                        <span>Simpan & Cetak Laporan</span>
                                    )}
                                </Button>
                            </DialogFooter>
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
                                Total kerja (hari)
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Total lembur (jam)
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Gaji pokok
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Gaji lembur
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Potongan
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Gaji bersih
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {salaries.data.length ? (
                            salaries.data.map((salary, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>
                                        {idx +
                                            1 +
                                            salaries.per_page *
                                                (salaries.current_page - 1)}
                                    </TableCell>
                                    <TableCell>{salary.employee.nip}</TableCell>
                                    <TableCell>
                                        {salary.employee.name}
                                    </TableCell>
                                    <TableCell>
                                        {salary.total_work_days}
                                    </TableCell>
                                    <TableCell>
                                        {salary.total_overtime_hours != null &&
                                        salary.total_overtime_hours > 0
                                            ? salary.total_overtime_hours
                                            : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {floatToIdCurrency(salary.basic_salary)}
                                    </TableCell>
                                    <TableCell>
                                        {salary.overtime_salary &&
                                        salary.overtime_salary > 0
                                            ? floatToIdCurrency(
                                                  salary.overtime_salary,
                                              )
                                            : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {salary.total_deduction > 0
                                            ? floatToIdCurrency(
                                                  salary.total_deduction,
                                              )
                                            : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {floatToIdCurrency(salary.net_salary)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={9}
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
            {salaries.total > salaries.per_page && (
                <PaginatorBuilder
                    prevUrl={salaries.prev_page_url ?? "#"}
                    nextUrl={salaries.next_page_url ?? "#"}
                    currentPage={salaries.current_page}
                    totalPage={salaries.last_page}
                />
            )}
        </AppLayout>
    );
};

export default SalaryDailyIndex;
