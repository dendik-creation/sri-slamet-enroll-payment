import AppLayout from "@/Partials/AppLayout";
import { PageTitle, PageTitleProps } from "@/Partials/PageTitle";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { PencilIcon, Plus, ReceiptText, SearchXIcon, TrashIcon } from "lucide-react";
import { useMemo } from "react";
import { Link, useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import ConfirmDialog from "@/Components/custom/ConfirmDialog";
import { SalaryDeduction } from "@/types/salaries";
import {
    MultiSelectSearchInput,
    SelectSearchInput,
} from "@/Components/custom/FormElement";
import { floatToIdCurrency } from "@/Components/helper/helper";
import { SelectOption } from "@/types/global";

type SalaryDeductionIndexProps = {
    salary_deductions: SalaryDeduction[];
    employees: SelectOption[];
} & PageTitleProps;

const SalaryDeductionIndex = ({
    salary_deductions,
    title,
    description,
    employees,
}: SalaryDeductionIndexProps) => {
    const employeeOptions = useMemo(
        () =>
            employees.map((e) => ({ label: e.label, value: String(e.value) })),
        [employees]
    );
    const { delete: deleteForm, processing: isDeleting } = useForm();
    const handleDelete = (id: number) => {
        if (isDeleting) return;
        deleteForm(`salary-deduction/${id}`, { preserveScroll: true, replace: true });
    };

    return (
        <AppLayout>
            <div className="flex justify-between items-center">
                <PageTitle title={title} description={description} />
                <Link href="/salary-deduction/create">
                    <Button variant="blue" className="cursor-pointer">
                        <Plus />
                        <span>Tambah Potongan Gaji</span>
                    </Button>
                </Link>
            </div>
 

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="bg-amber-200 font-semibold">
                                #
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Nama Potongan Gaji
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Jumlah Potongan
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Target Karyawan
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Frekuensi
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {salary_deductions.length ? (
                            salary_deductions.map((sd, idx) => (
                                <TableRow key={sd.id}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>
                                        <span>{sd.name}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span>
                                            {floatToIdCurrency(sd.amount, true, false)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span>
                                            {sd.target_employee === "all"
                                                ? "Semua Karyawan"
                                                : sd.target_employee === "monthly"
                                                ? "Karyawan Bulanan"
                                                : sd.target_employee === "daily"
                                                ? "Karyawan Harian"
                                                : sd.target_employee === "specific"
                                                ? "Karyawan Tertentu"
                                                : sd.target_employee}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span>
                                            {sd.frequency === "monthly_once" ? "Sekali per Bulan" : "Setiap Gajian"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link href={`salary-deduction/${sd.id}`}>
                                                <Button variant="yellow" size="icon">
                                                    <ReceiptText />
                                                </Button>
                                            </Link>
                                            <Link href={`salary-deduction/${sd.id}/edit`}>
                                                <Button variant="blue" size="icon">
                                                    <PencilIcon />
                                                </Button>
                                            </Link>
                                            <ConfirmDialog
                                                title="Hapus Potongan Gaji"
                                                description="Apakah Anda yakin ingin menghapus potongan gaji ini?"
                                                type="danger"
                                                confirmAction={() => handleDelete(sd.id)}
                                                triggerNode={
                                                    <Button variant="red" size="icon" disabled={isDeleting}>
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
                                    colSpan={5}
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
        </AppLayout>
    );
};

export default SalaryDeductionIndex;
