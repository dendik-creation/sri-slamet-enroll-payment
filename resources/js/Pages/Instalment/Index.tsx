import {
    DatePickerInput,
    PaginatorBuilder,
    SearchInput,
    SelectSearchInput,
} from "@/Components/custom/FormElement";
import { floatToIdCurrency, inputDebounce } from "@/Components/helper/helper";
import AppLayout from "@/Partials/AppLayout";
import { PageTitle } from "@/Partials/PageTitle";
import { Instalment, InstalmentIndexProps } from "@/types/instalment";
import { Link, router, useForm } from "@inertiajs/react";
import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    CircleCheck,
    CircleX,
    Loader,
    Pencil,
    Plus,
    Printer,
    ReceiptText,
    SearchXIcon,
    Trash2,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogHeader,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/Components/ui/dialog";
import ConfirmDialog from "@/Components/custom/ConfirmDialog";
import BlastToaster from "@/Components/custom/BlastToaster";
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

const InstalmentIndex = ({
    title,
    description,
    instalments,
    filters,
}: InstalmentIndexProps) => {
    const { delete: deleteInstalment, processing: isDeleting } = useForm();
    const [filterData, setFilterData] = useState({
        employee_search: filters.employee_search || "",
    });
    const {
        data: leggerData,
        setData: setLeggerData,
        processing: leggerProcessing,
        get: leggerGet,
        reset: resetLeggerForm,
    } = useForm({
        legger_mode: "",
        latest_date: "",
        month: "",
    });
    const debouncedFilter = inputDebounce((employee_search: string) => {
        router.get(
            "/instalment",
            { employee_search },
            {
                preserveState: true,
                replace: true,
            }
        );
    });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFilterData((prev) => {
            const newData = { ...prev, employee_search: value };
            debouncedFilter(newData.employee_search);
            return newData;
        });
    };

    const handleDelete = (id: number) => {
        if (isDeleting) return;
        deleteInstalment(`/instalment/${id}`, {
            preserveScroll: true,
            replace: true,
        });
    };
    const validateLeggerForm = () => {
        let isValid = true;
        if (!leggerData.legger_mode) {
            isValid = false;
        }
        if (leggerData.legger_mode === "DATE_RANGE") {
            if (!leggerData.latest_date) {
                isValid = false;
            }
        }
        if (leggerData.legger_mode === "MONTHLY") {
            if (!leggerData.month) {
                isValid = false;
            }
        }
        return isValid;
    };
    const handleSubmitLegger = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateLeggerForm()) {
            BlastToaster("error", "Lengkapi form sebelum mencetak");
            return;
        }

        leggerGet("/instalment/print-legger", {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => resetLeggerForm(),
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
                        value={filterData.employee_search || ""}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant={"green"}
                                type="button"
                                className="cursor-pointer"
                            >
                                <Printer />
                                <span>Cetak Legger Angsuran</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-5xl">
                            <form onSubmit={handleSubmitLegger}>
                                <DialogHeader>
                                    <DialogTitle>
                                        Cetak Legger Angsuran
                                    </DialogTitle>
                                    <DialogDescription>
                                        Silahkan sesuaikan data yang ingin
                                        dicetak
                                    </DialogDescription>

                                    <div className="flex flex-col gap-3">
                                        <div className="grid lg:grid-cols-2 grid-cols-1 gap-3 mt-4">
                                            <div className="flex flex-col w-full">
                                                <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                    Data Berdasarkan
                                                </label>
                                                <SelectSearchInput
                                                    value={
                                                        leggerData.legger_mode ||
                                                        ""
                                                    }
                                                    options={[
                                                        {
                                                            value: "DATE_RANGE",
                                                            label: "Tanggal Terbaru",
                                                        },
                                                        {
                                                            value: "MONTHLY",
                                                            label: "Penentuan Bulan",
                                                        },
                                                    ]}
                                                    placeholder="Pilih Data Berdasarkan"
                                                    onChange={(value) =>
                                                        setLeggerData(
                                                            "legger_mode",
                                                            String(value || "")
                                                        )
                                                    }
                                                    removeValue={() =>
                                                        setLeggerData(
                                                            "legger_mode",
                                                            ""
                                                        )
                                                    }
                                                />
                                            </div>
                                            {leggerData.legger_mode ==
                                                "DATE_RANGE" && (
                                                <div className="flex flex-col w-full">
                                                    <label className="text-base mb-1 after:content-['*'] after:text-red-500 after:ml-1">
                                                        Tanggal Terakhir
                                                        Pembayaran
                                                    </label>
                                                    <DatePickerInput
                                                        className=""
                                                        value={
                                                            leggerData.latest_date ||
                                                            undefined
                                                        }
                                                        placeholder="Pilih tanggal"
                                                        mode="single"
                                                        onChange={(date) => {
                                                            setLeggerData(
                                                                "latest_date",
                                                                date || ""
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {leggerData.legger_mode ==
                                                "MONTHLY" && (
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
                                                                    value || ""
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
                                        variant={"green"}
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
                    <Link href={"/instalment/create"}>
                        <Button
                            variant="blue"
                            className="flex items-center gap-2"
                        >
                            <Plus />
                            <span>Tambah Angsuran Baru</span>
                        </Button>
                    </Link>
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
                                Total Angsuran
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Nominal Angsuran per Periode
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Sisa Angsuran
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Lunas / Tidak
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {instalments.data.length ? (
                            instalments.data.map(
                                (instalment: Instalment, idx: number) => (
                                    <TableRow key={instalment.id}>
                                        <TableCell>
                                            {idx +
                                                1 +
                                                instalments.per_page *
                                                    (instalments.current_page -
                                                        1)}
                                        </TableCell>
                                        <TableCell>
                                            {instalment.employee.nip}
                                        </TableCell>
                                        <TableCell>
                                            {instalment.employee.name}
                                        </TableCell>
                                        <TableCell>
                                            {floatToIdCurrency(
                                                instalment.total_amount
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {floatToIdCurrency(
                                                instalment.instalment_value
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {floatToIdCurrency(
                                                instalment.remaining_amount
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {Number(
                                                instalment.remaining_amount
                                            ) === 0 ? (
                                                <span className="text-green-600 font-semibold">
                                                    <CircleCheck />
                                                </span>
                                            ) : (
                                                <span className="text-red-600 font-semibold">
                                                    <CircleX />
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            <Link
                                                href={`/instalment/${instalment.id}`}
                                            >
                                                <Button
                                                    variant="yellow"
                                                    size={"icon"}
                                                >
                                                    <ReceiptText />
                                                </Button>
                                            </Link>
                                            <Link
                                                href={`/instalment/${instalment.id}/edit`}
                                            >
                                                <Button
                                                    variant="blue"
                                                    size={"icon"}
                                                >
                                                    <Pencil />
                                                </Button>
                                            </Link>
                                            <ConfirmDialog
                                                title="Hapus Angsuran?"
                                                description="Data angsuran akan dihapus. Apakah Anda yakin?"
                                                type="danger"
                                                triggerNode={
                                                    <Button
                                                        variant="red"
                                                        size="icon"
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                }
                                                confirmAction={() =>
                                                    handleDelete(instalment.id)
                                                }
                                                disabled={isDeleting}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )
                            )
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
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
            {instalments.total > instalments.per_page && (
                <PaginatorBuilder
                    prevUrl={instalments.prev_page_url ?? "#"}
                    nextUrl={instalments.next_page_url ?? "#"}
                    currentPage={instalments.current_page}
                    totalPage={instalments.last_page}
                />
            )}
        </AppLayout>
    );
};

export default InstalmentIndex;
