import AppLayout from "@/Partials/AppLayout";
import { PageTitle } from "@/Partials/PageTitle";
import { ThrBonusIndexProps } from "@/types/thr_bonus";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Eye, Plus, SearchXIcon, Trash } from "lucide-react";
import { floatToIdCurrency, ymdToIdDate } from "@/Components/helper/helper";
import { Button } from "@/Components/ui/button";
import { Link, router } from "@inertiajs/react";
import ConfirmDialog from "@/Components/custom/ConfirmDialog";
import { PaginatorBuilder } from "@/Components/custom/FormElement";
const ThrBonusIndex = ({
    title,
    description,
    thr_bonuses,
    is_thr_given,
}: ThrBonusIndexProps) => {
    const currentYear = new Date().getFullYear();
    const storeThrCurrentYear = () => {
        router.post(
            "/thr",
            {
                year: currentYear.toString(),
            },
            {
                replace: true,
                preserveState: true,
            }
        );
    };
    const handleDelete = (thrId: number) => {
        router.delete(`/thr/${thrId}`, {
            preserveState: true,
            replace: true,
        });
    };
    return (
        <AppLayout>
            <div className="flex justify-between items-center">
                <PageTitle title={title} description={description} />
                <ConfirmDialog
                    disabled={is_thr_given}
                    triggerNode={
                        <Button
                            disabled={is_thr_given}
                            variant={"blue"}
                            className="flex items-center gap-2"
                        >
                            <Plus />
                            Tambah THR untuk {currentYear}
                        </Button>
                    }
                    title="Konfirmasi Tambah THR"
                    description={`Apakah Anda yakin ingin menambah THR untuk tahun ${currentYear}?`}
                    type="info"
                    confirmAction={storeThrCurrentYear}
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="bg-amber-200 font-semibold">
                                #
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Tahun
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Tanggal pemberian
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Total penerima (karyawan)
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Total pengeluaran
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {thr_bonuses.data.length ? (
                            thr_bonuses.data.map((thr, idx) => (
                                <TableRow key={thr.id}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>{thr.year}</TableCell>
                                    <TableCell>
                                        {ymdToIdDate(thr.paid_at)}
                                    </TableCell>
                                    <TableCell>
                                        {thr.employee_thrs.length}
                                    </TableCell>
                                    <TableCell>
                                        {floatToIdCurrency(
                                            thr.total_amount ?? 0
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/thr/${thr.id}`}>
                                                <Button
                                                    variant={"blue"}
                                                    size={"icon"}
                                                >
                                                    <Eye />
                                                </Button>
                                            </Link>
                                            <ConfirmDialog
                                                triggerNode={
                                                    <Button
                                                        variant={"red"}
                                                        size={"icon"}
                                                    >
                                                        <Trash />
                                                    </Button>
                                                }
                                                title="Konfirmasi Hapus THR"
                                                description={`Menghapus THR akan mempengaruhi total pengeluaran pada sistem penggajian`}
                                                type="danger"
                                                confirmAction={() =>
                                                    handleDelete(thr.id)
                                                }
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
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
            {thr_bonuses.total > thr_bonuses.per_page && (
                <PaginatorBuilder
                    prevUrl={thr_bonuses.prev_page_url ?? "#"}
                    nextUrl={thr_bonuses.next_page_url ?? "#"}
                    currentPage={thr_bonuses.current_page}
                    totalPage={thr_bonuses.last_page}
                />
            )}
        </AppLayout>
    );
};

export default ThrBonusIndex;
