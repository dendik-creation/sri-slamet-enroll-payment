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
    Eye,
    Printer,
    SearchXIcon,
    Edit,
    Loader,
    TrashIcon,
} from "lucide-react";
import {
    floatToIdCurrency,
    inputDebounce,
    ymdToIdDate,
} from "@/Components/helper/helper";
import { Button } from "@/Components/ui/button";
import { Link, router, useForm } from "@inertiajs/react";
import {
    DatePickerInput,
    PaginatorBuilder,
    SelectSearchInput,
} from "@/Components/custom/FormElement";
import { useEffect, useRef } from "react";
import { SalarySlipViewProps } from "@/types/salaries";
import {
    Dialog,
    DialogHeader,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/Components/ui/dialog";
import { SelectOption } from "@/types/global";
import BlastToaster from "@/Components/custom/BlastToaster";
import ConfirmDialog from "@/Components/custom/ConfirmDialog";

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

const SalarySlipIndex = ({
    title,
    description,
    salaries,
    employees,
    employee_id,
    start_date,
    end_date,
    employee_type,
}: SalarySlipViewProps) => {
    const { delete: deleteSalary, processing: isDeleting } = useForm();
    const {
        data: filterData,
        setData: setFilterData,
        processing: isFiltering,
    } = useForm({
        employee_id: employee_id || "",
        start_date: start_date || "",
        end_date: end_date || "",
        employee_type: employee_type || "",
    });

    const previousFilterData = useRef({
        employee_id: employee_id || "",
        start_date: start_date || "",
        end_date: end_date || "",
        employee_type: employee_type || "",
    });

    const {
        data: leggerData,
        setData: setLeggerData,
        get: getLegger,
        processing: leggerProcessing,
    } = useForm({
        employee_type: "",
        start_date: filterData.start_date || "",
        end_date: filterData.end_date || "",
        month: (new Date().getMonth() + 1).toString(),
    });

    const validateLeggerForm = (): boolean => {
        if (!leggerData.employee_type) {
            return false;
        }
        if (
            leggerData.employee_type === "daily" &&
            (!leggerData.start_date || !leggerData.end_date)
        ) {
            return false;
        }
        if (leggerData.employee_type === "monthly" && !leggerData.month) {
            return false;
        }
        return true;
    };

    const handleSubmitLegger = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateLeggerForm()) {
            BlastToaster("error", "Lengkapi form dengan benar");
            return;
        }
        if (leggerData.employee_type == "daily") {
            getLegger("/salary-daily/print");
        } else if (leggerData.employee_type == "monthly") {
            getLegger("/salary-monthly/print");
        }
    };

    useEffect(() => {
        const hasFilterChanged =
            previousFilterData.current.employee_id !== filterData.employee_id ||
            previousFilterData.current.start_date !== filterData.start_date ||
            previousFilterData.current.end_date !== filterData.end_date ||
            previousFilterData.current.employee_type !==
                filterData.employee_type;

        if (hasFilterChanged) {
            debouncedFilter(
                filterData.employee_id,
                filterData.start_date,
                filterData.end_date,
                filterData.employee_type
            );

            previousFilterData.current = {
                employee_id: filterData.employee_id,
                start_date: filterData.start_date,
                end_date: filterData.end_date,
                employee_type: filterData.employee_type,
            };
        }
    }, [
        filterData.employee_id,
        filterData.start_date,
        filterData.end_date,
        filterData.employee_type,
    ]);

    useEffect(() => {
        const newFilterData = {
            employee_id: employee_id || "",
            start_date: start_date || "",
            end_date: end_date || "",
            employee_type: employee_type || "",
        };

        setFilterData(newFilterData);

        previousFilterData.current = newFilterData;
    }, [employee_id, start_date, end_date, employee_type, setFilterData]);

    const debouncedFilter = inputDebounce(
        (
            employee_id: string,
            start_date: string,
            end_date: string,
            employee_type: string
        ) => {
            router.get(
                "/salary-slip",
                { employee_id, start_date, end_date, employee_type },
                {
                    preserveState: true,
                    replace: true,
                }
            );
        }
    );

    const handleChangeFilter = (value: string, name: string) => {
        setFilterData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDelete = (id: number) => {
        if (isDeleting) return;
        deleteSalary(`/salary-slip/${id}`, {
            preserveScroll: true,
            replace: true,
        });
    };
    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            <div className="flex lg:flex-row flex-col lg:gap-0 gap-3 items-start lg:items-center justify-between mb-4">
                <div className="flex-1 flex items-end justify-between relative w-full">
                    <div className="flex flex-col gap-2 w-full">
                        <span>
                            Pilih Karyawan secara spesifik (Untuk karyawan
                            bulanan pilih rentang tanggal 1 bulan penuh)
                        </span>
                        <div className="flex gap-3 items-center">
                            <div className="">
                                <DatePickerInput
                                    className="w-fit"
                                    value={{
                                        from: new Date(filterData.start_date),
                                        to: new Date(filterData.end_date),
                                    }}
                                    placeholder="Pilih rentang tanggal"
                                    onChange={(dateRange) => {
                                        if (
                                            dateRange &&
                                            typeof dateRange === "string"
                                        ) {
                                            const [start, end] =
                                                dateRange.split(" - ");
                                            setFilterData((prev) => ({
                                                ...prev,
                                                start_date: start,
                                                end_date: end,
                                            }));
                                        }
                                    }}
                                    mode="range"
                                />
                            </div>
                            <div className="">
                                <SelectSearchInput
                                    value={filterData.employee_id.toString()}
                                    onChange={(employee_id) =>
                                        handleChangeFilter(
                                            String(employee_id || ""),
                                            "employee_id"
                                        )
                                    }
                                    placeholder="Pilih Nama Karyawan"
                                    options={employees}
                                    removeValue={() =>
                                        handleChangeFilter("", "employee_id")
                                    }
                                />
                            </div>
                            <div className="">
                                <SelectSearchInput
                                    value={filterData.employee_type || ""}
                                    onChange={(employee_type) =>
                                        handleChangeFilter(
                                            String(employee_type || ""),
                                            "employee_type"
                                        )
                                    }
                                    placeholder="Pilih Tipe Gaji"
                                    options={[
                                        { value: "monthly", label: "Bulanan" },
                                        { value: "daily", label: "Harian" },
                                    ]}
                                    removeValue={() =>
                                        handleChangeFilter("", "employee_type")
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant={"blue"}
                                    type="button"
                                    className="cursor-pointer"
                                >
                                    <Printer />
                                    <span>Cetak Laporan Gaji (Legger)</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-5xl">
                                <form onSubmit={handleSubmitLegger}>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Cetak Laporan Gaji (Legger)
                                        </DialogTitle>
                                        <DialogDescription>
                                            Silahkan sesuaikan data yang ingin
                                            dicetak
                                        </DialogDescription>

                                        <div className="flex flex-col gap-3">
                                            <div className="grid lg:grid-cols-2 grid-cols-1 gap-3 mt-4">
                                                <div className="flex flex-col w-full">
                                                    <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                        Tipe Gaji Karyawan
                                                    </label>
                                                    <SelectSearchInput
                                                        value={
                                                            leggerData.employee_type ||
                                                            ""
                                                        }
                                                        options={[
                                                            {
                                                                value: "daily",
                                                                label: "Harian",
                                                            },
                                                            {
                                                                value: "monthly",
                                                                label: "Bulanan",
                                                            },
                                                        ]}
                                                        placeholder="Pilih tipe gaji karyawan"
                                                        onChange={(value) =>
                                                            setLeggerData(
                                                                "employee_type",
                                                                String(
                                                                    value || ""
                                                                )
                                                            )
                                                        }
                                                        removeValue={() =>
                                                            setLeggerData(
                                                                "employee_type",
                                                                ""
                                                            )
                                                        }
                                                    />
                                                </div>
                                                {leggerData.employee_type ==
                                                    "daily" && (
                                                    <div className="flex flex-col w-full">
                                                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                            Rentang Tanggal
                                                            Kehadiran
                                                        </label>
                                                        <DatePickerInput
                                                            className=""
                                                            value={
                                                                leggerData.start_date &&
                                                                leggerData.end_date
                                                                    ? {
                                                                          from: new Date(
                                                                              leggerData.start_date
                                                                          ),
                                                                          to: new Date(
                                                                              leggerData.end_date
                                                                          ),
                                                                      }
                                                                    : undefined
                                                            }
                                                            placeholder="Pilih rentang tanggal"
                                                            mode="range"
                                                            onChange={(
                                                                dateRange
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
                                                                            " - "
                                                                        );
                                                                    setLeggerData(
                                                                        "start_date",
                                                                        start
                                                                    );
                                                                    setLeggerData(
                                                                        "end_date",
                                                                        end
                                                                    );
                                                                } else {
                                                                    setLeggerData(
                                                                        "start_date",
                                                                        ""
                                                                    );
                                                                    setLeggerData(
                                                                        "end_date",
                                                                        ""
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                {leggerData.employee_type ==
                                                    "monthly" && (
                                                    <div className="flex flex-col w-full">
                                                        <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                            Bulan
                                                        </label>
                                                        <SelectSearchInput
                                                            value={
                                                                leggerData.month ||
                                                                ""
                                                            }
                                                            options={months}
                                                            placeholder="Pilih bulan"
                                                            onChange={(value) =>
                                                                setLeggerData(
                                                                    "month",
                                                                    String(
                                                                        value ||
                                                                            ""
                                                                    )
                                                                )
                                                            }
                                                            removeValue={() =>
                                                                setLeggerData(
                                                                    "month",
                                                                    ""
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button
                                            type="submit"
                                            variant={"blue"}
                                            className="w-full mt-4 p-3 "
                                            disabled={leggerProcessing}
                                        >
                                            {leggerProcessing ? (
                                                <Loader className="animate-spin" />
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Printer />
                                                    <span>Cetak</span>
                                                </span>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Link
                            href={
                                salaries.data.length == 0
                                    ? "#"
                                    : `/salary-slip/print/all?start_date=${filterData.start_date}&end_date=${filterData.end_date}&employee_id=${filterData.employee_id}&employee_type=${filterData.employee_type}`
                            }
                        >
                            <Button
                                disabled={salaries.data.length == 0}
                                variant={"green"}
                                className="flex items-center gap-2"
                            >
                                <Printer />
                                <span>Cetak Semua slip dibawah</span>
                            </Button>
                        </Link>
                    </div>
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
                                Tanggal Penggajian
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
                                Bonus
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Gaji bersih
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {salaries.data.length ? (
                            salaries.data.map((salary, idx) => (
                                <TableRow key={salary.id}>
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
                                        {ymdToIdDate(salary.salary_date)}
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
                                        {salary.overtime_salary > 0
                                            ? floatToIdCurrency(
                                                  salary.overtime_salary
                                              )
                                            : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <ul className="list-disc">
                                            {salary.deductions &&
                                                salary.deductions.length > 0 &&
                                                salary.deductions.map(
                                                    (deduction, idx) => (
                                                        <li key={idx}>
                                                            {
                                                                deduction
                                                                    .deduction
                                                                    .name
                                                            }
                                                            {" ("}
                                                            {floatToIdCurrency(
                                                                deduction.amount
                                                            )}
                                                            {")"}
                                                        </li>
                                                    )
                                                )}
                                            {salary.instalment_payment && (
                                                <li>
                                                    Angsur ke -{" "}
                                                    {
                                                        salary
                                                            .instalment_payment
                                                            .step
                                                    }{" "}
                                                    {" ("}
                                                    {floatToIdCurrency(
                                                        salary
                                                            .instalment_payment
                                                            .payment_value
                                                    )}
                                                    {")"}
                                                </li>
                                            )}
                                        </ul>
                                        {salary.deductions?.length === 0 &&
                                            !salary.instalment_payment && (
                                                <span>-</span>
                                            )}
                                    </TableCell>
                                    <TableCell>
                                        {salary.bonuses && salary.bonuses.length
                                            ? floatToIdCurrency(
                                                  salary.bonuses.reduce(
                                                      (acc, bonus) =>
                                                          acc + bonus.amount,
                                                      0
                                                  )
                                              )
                                            : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {floatToIdCurrency(salary.net_salary)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={
                                                    "salary-slip/show/" +
                                                    salary.id
                                                }
                                            >
                                                <Button
                                                    size={"icon"}
                                                    variant={"blue"}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Eye />
                                                </Button>
                                            </Link>
                                            <Link
                                                href={
                                                    "salary-slip/edit/" +
                                                    salary.id
                                                }
                                            >
                                                <Button
                                                    size={"icon"}
                                                    variant={"purple"}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Edit />
                                                </Button>
                                            </Link>
                                            <Link
                                                href={
                                                    "salary-slip/print/spesific/" +
                                                    salary.id
                                                }
                                            >
                                                <Button
                                                    size={"icon"}
                                                    variant={"yellow"}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Printer />
                                                </Button>
                                            </Link>
                                            <ConfirmDialog
                                                title="Hapus Gaji Karyawan"
                                                description="Menghapus gaji karyawan akan menghilangkan pembayaran angsuran (jika ada) dan mempengaruhi laporan total pengeluaran gaji. Apakah Anda yakin ingin melanjutkan?"
                                                type="danger"
                                                confirmAction={() =>
                                                    handleDelete(salary.id)
                                                }
                                                triggerNode={
                                                    <Button
                                                        variant="red"
                                                        size="icon"
                                                        disabled={isDeleting}
                                                    >
                                                        <TrashIcon />
                                                    </Button>
                                                }
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={12}
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

export default SalarySlipIndex;
