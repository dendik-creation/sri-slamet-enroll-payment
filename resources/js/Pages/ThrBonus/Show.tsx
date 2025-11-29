import DynamicCard from "@/Components/custom/DynamicCard";
import { floatToIdCurrency } from "@/Components/helper/helper";
import AppLayout from "@/Partials/AppLayout";
import { PageTitle } from "@/Partials/PageTitle";
import { ThrBonusShowProps } from "@/types/thr_bonus";
import {
    DiamondPercent,
    IdCardLanyard,
    Printer,
    SearchXIcon,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import React from "react";
import { Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";

const ThrBonusShow = ({ title, description, thr_bonus }: ThrBonusShowProps) => {
    return (
        <AppLayout>
            <PageTitle title={title} description={description} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <DynamicCard
                    title="Jumlah penerima"
                    value={thr_bonus.employee_thrs.length}
                    icon={
                        <IdCardLanyard className="w-32 h-32 text-yellow-200" />
                    }
                    color="yellow"
                />
                <DynamicCard
                    title="Dana yang dikeluarkan"
                    value={floatToIdCurrency(thr_bonus.total_amount)}
                    icon={
                        <DiamondPercent className="w-32 h-32 text-green-200" />
                    }
                    color="green"
                />
                <Card className="relative overflow-hidden">
                    <CardContent>
                        <div className={`flex items-center space-x-4`}>
                            <div className={`absolute -bottom-8 -right-10`}>
                                <Printer className="w-32 h-32 text-blue-200" />
                            </div>
                            <div>
                                <h3 className="text-lg mb-2 font-semibold">
                                    Cetak Slip THR
                                </h3>
                                <Link href={`/thr/${thr_bonus.id}/print-all`}>
                                    <Button
                                        variant={"blue"}
                                        className="flex items-center gap-3 bg-blue-400"
                                    >
                                        <Printer />
                                        <span>
                                            Cetak semua yang ada dibawah
                                        </span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
                                Nama Karyawan
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Nilai THR
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {thr_bonus.employee_thrs.length ? (
                            thr_bonus.employee_thrs.map((thr, idx) => (
                                <TableRow key={thr.id}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>{thr.employee?.nip}</TableCell>
                                    <TableCell>{thr.employee?.name}</TableCell>
                                    <TableCell>
                                        {floatToIdCurrency(thr.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/thr/${thr_bonus.id}/print/${thr.id}`}
                                            >
                                                <Button
                                                    variant={"yellow"}
                                                    size={"icon"}
                                                >
                                                    <Printer />
                                                </Button>
                                            </Link>
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
        </AppLayout>
    );
};

export default ThrBonusShow;
