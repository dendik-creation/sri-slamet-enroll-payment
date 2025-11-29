import { floatToIdCurrency, ymdToIdDate } from "@/Components/helper/helper";
import { Card, CardContent } from "@/Components/ui/card";
import AppLayout from "@/Partials/AppLayout";
import { PageTitle } from "@/Partials/PageTitle";
import { InstalmentShowProps } from "@/types/instalment";
import {
    BanknoteArrowUp,
    HandCoins,
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

const InstalmentShow = ({
    title,
    description,
    instalment,
}: InstalmentShowProps) => {
    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            <div className="mt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Card className="py-3">
                        <CardContent className="px-3">
                            <div className="flex items-center gap-3 mb-2">
                                <IdCardLanyard className="text-slate-400" />
                                <h3 className="font-semibold">
                                    Informasi Karyawan
                                </h3>
                            </div>
                            <div className="text-sm flex flex-col gap-2">
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        NIP
                                    </span>
                                    <span>{instalment.employee.nip}</span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        Nama
                                    </span>
                                    <span>{instalment.employee.name}</span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        Jabatan
                                    </span>
                                    <span>
                                        {instalment.employee.position.name}
                                    </span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        Tanggal Bergabung
                                    </span>
                                    <span>
                                        {ymdToIdDate(
                                            instalment.employee.join_date.toString()
                                        )}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="py-3">
                        <CardContent className="px-3">
                            <div className="flex items-center gap-3 mb-2">
                                <HandCoins className="text-slate-400" />
                                <h3 className="font-semibold">
                                    Informasi Angsuran
                                </h3>
                            </div>
                            <div className="text-sm flex flex-col gap-2">
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        Total Angsuran
                                    </span>
                                    <span>
                                        {floatToIdCurrency(
                                            instalment.total_amount
                                        )}
                                    </span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        Nominal Angsuran per Periode
                                    </span>
                                    <span>
                                        {floatToIdCurrency(
                                            instalment.instalment_value
                                        )}
                                    </span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        Sisa Angsuran
                                    </span>
                                    <span>
                                        {floatToIdCurrency(
                                            instalment.remaining_amount
                                        )}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="py-3">
                    <CardContent className="px-3">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <BanknoteArrowUp className="text-slate-400" />
                                <h3 className="font-semibold">
                                    Riwayat Pembayaran Angsuran
                                </h3>
                            </div>
                            {instalment.payments &&
                                instalment.payments.length > 0 && (
                                    <Link
                                        href={
                                            "/instalment/" +
                                            instalment.id +
                                            "/print"
                                        }
                                    >
                                        <Button variant={"green"}>
                                            <Printer />
                                            <span>Cetak Laporan</span>
                                        </Button>
                                    </Link>
                                )}
                        </div>

                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="bg-amber-200 font-semibold">
                                            Angsuran Ke-
                                        </TableHead>
                                        <TableHead className="bg-amber-200 font-semibold">
                                            Nominal Angsuran
                                        </TableHead>
                                        <TableHead className="bg-amber-200 font-semibold">
                                            Sumber Pembayaran
                                        </TableHead>
                                        <TableHead className="bg-amber-200 font-semibold">
                                            Tanggal Pembayaran
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {instalment.payments?.map(
                                        (payment, index) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>
                                                    {payment.step}
                                                </TableCell>
                                                <TableCell>
                                                    {floatToIdCurrency(
                                                        payment.payment_value
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {payment.payment_source ==
                                                    "salary"
                                                        ? "Potongan Gaji"
                                                        : "Langsung / Terdahulu"}
                                                </TableCell>
                                                <TableCell>
                                                    {ymdToIdDate(
                                                        payment.paid_at
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}

                                    {instalment.payments == null ||
                                        (instalment.payments?.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={4}
                                                    className="h-24 text-center"
                                                >
                                                    <div className="w-full flex flex-col items-center justify-center h-full gap-2">
                                                        <SearchXIcon
                                                            width={64}
                                                            className="text-red-400"
                                                        />
                                                        <span>
                                                            Data tidak ada
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default InstalmentShow;
