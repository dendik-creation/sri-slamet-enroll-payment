import React from "react";
import AppLayout from "@/Partials/AppLayout";
import { PageTitle } from "@/Partials/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { floatToIdCurrency } from "@/Components/helper/helper";
import {
    TrendingUp,
    TrendingDown,
    Users,
    Receipt,
    DollarSign,
    Award,
    Gift,
    DiamondPercent,
} from "lucide-react";
import Chart from "react-apexcharts";
import { DashboardProps } from "@/types/dashboard";
import DynamicCard from "@/Components/custom/DynamicCard";

const Dashboard: React.FC<DashboardProps> = ({
    title,
    summary,
    charts,
    top_employees,
}) => {
    const isPositiveChange = summary.percentage_change >= 0;

    // Salary Trend Chart Configuration
    const salaryTrendOptions = {
        chart: {
            type: "area" as const,
            height: 350,
            toolbar: { show: false },
            background: "transparent",
        },
        colors: ["#3b82f6", "#8b5cf6", "#10b981"],
        dataLabels: { enabled: false },
        stroke: { curve: "smooth" as const, width: 2 },
        fill: {
            type: "gradient",
            gradient: {
                shade: "light",
                type: "vertical",
                shadeIntensity: 0.3,
                gradientToColors: ["#1d4ed8", "#7c3aed", "#059669"],
                inverseColors: false,
                opacityFrom: 0.8,
                opacityTo: 0.1,
            },
        },
        grid: { borderColor: "#e5e7eb" },
        xaxis: {
            categories: charts.salary_trend.map((item) => item.month),
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                formatter: (value: number) => `${value / 1000000}Jt`,
            },
        },
        tooltip: {
            y: {
                formatter: (value: number) => floatToIdCurrency(value),
            },
        },
        legend: {
            position: "top" as const,
            horizontalAlign: "center" as const,
        },
    };

    const salaryTrendSeries = [
        {
            name: "Gaji Bersih",
            data: charts.salary_trend.map((item) => item.total),
        },
        {
            name: "Angsuran",
            data: charts.salary_trend.map((item) => item.instalment_total),
        },
        {
            name: "THR",
            data: charts.salary_trend.map((item) => item.thr_total),
        },
        {
            name: "Total Pengeluaran",
            data: charts.salary_trend.map((item) => item.combined_total),
        },
    ];

    // Daily Activity Chart Configuration
    const dailyActivityOptions = {
        chart: {
            type: "line" as const,
            height: 350,
            toolbar: { show: false },
        },
        colors: ["#10b981", "#f59e0b"],
        stroke: { width: 3, curve: "smooth" as const },
        grid: { borderColor: "#e5e7eb" },
        xaxis: {
            categories: charts.daily_activity.map((item) => item.date),
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: [
            {
                title: { text: "Gaji (Rp)" },
                labels: {
                    formatter: (value: number) =>
                        `${(value / 1000000).toFixed(1)}Jt`,
                },
            },
            {
                opposite: true,
                title: { text: "Kehadiran" },
                labels: {
                    formatter: (value: number) => `${value} org`,
                },
            },
        ],
        tooltip: {
            y: [
                {
                    formatter: (value: number) => floatToIdCurrency(value),
                },
                {
                    formatter: (value: number) => `${value} orang`,
                },
            ],
        },
        legend: {
            position: "top" as const,
            horizontalAlign: "center" as const,
        },
    };

    const dailyActivitySeries = [
        {
            name: "Gaji Harian",
            type: "line",
            data: charts.daily_activity.map((item) => item.salary),
        },
        {
            name: "Kehadiran",
            type: "line",
            data: charts.daily_activity.map((item) => item.attendance),
        },
    ];

    // Salary by Position Chart Configuration
    const positionOptions = {
        chart: {
            type: "donut" as const,
            height: 350,
        },
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
        labels: charts.salary_by_position.map((item) => item.position),
        dataLabels: {
            enabled: true,
            formatter: (val: number) => `${val.toFixed(1)}%`,
        },
        legend: {
            position: "bottom" as const,
            horizontalAlign: "center" as const,
        },
        tooltip: {
            y: {
                formatter: (value: number) => floatToIdCurrency(value),
            },
        },
        plotOptions: {
            pie: {
                donut: {
                    size: "70%",
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: "Total",
                            formatter: () =>
                                floatToIdCurrency(
                                    charts.salary_by_position.reduce(
                                        (sum, item) => sum + item.total,
                                        0
                                    )
                                ),
                        },
                    },
                },
            },
        },
    };

    const positionSeries = charts.salary_by_position.map((item) => item.total);
    const currentMonthYear = `${new Date().toLocaleString("id-ID", {
        month: "long",
        year: "numeric",
    })}`;

    return (
        <AppLayout>
            <PageTitle
                title={title}
                description="Halaman utama untuk melihat ringkasan data penggajian"
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <DynamicCard
                    title="Total Karyawan"
                    value={summary.total_employees}
                    icon={<Users className="w-32 h-32 text-blue-200" />}
                    color="blue"
                />

                <DynamicCard
                    title={`Total Pengeluaran ${currentMonthYear}`}
                    value={floatToIdCurrency(summary.total_combined_this_month)}
                    icon={<DollarSign className="w-32 h-32 text-green-200" />}
                    color="green"
                    subfooter={
                        <div className="flex items-center mt-2">
                            {isPositiveChange ? (
                                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                            )}
                            <span
                                className={`text-sm ${
                                    isPositiveChange
                                        ? "text-green-500"
                                        : "text-red-500"
                                }`}
                            >
                                {Math.abs(summary.percentage_change)}% dari
                                periode sebelumnya
                            </span>
                        </div>
                    }
                />

                <DynamicCard
                    title="Transaksi Gaji"
                    value={summary.total_transactions_this_month}
                    icon={<Receipt className="w-32 h-32 text-yellow-200" />}
                    color="yellow"
                />

                <DynamicCard
                    title={`THR Tahun ${summary.current_year}`}
                    value={floatToIdCurrency(summary.total_thr_this_year)}
                    icon={
                        <DiamondPercent className="w-32 h-32 text-purple-200" />
                    }
                    color="purple"
                    subfooter={
                        <div className="text-sm text-muted-foreground mt-2">
                            {summary.total_thr_transactions_this_year} transaksi
                            THR
                        </div>
                    }
                />
            </div>

            {/* Detailed Expense Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <DynamicCard
                    title="Gaji Bersih"
                    value={floatToIdCurrency(summary.total_salaries_this_month)}
                    icon={<DollarSign className="w-20 h-20 text-green-100" />}
                    color="green"
                    subfooter={
                        <div className="text-xs text-muted-foreground mt-1">
                            Setelah potongan
                        </div>
                    }
                />

                <DynamicCard
                    title="Total Angsuran"
                    value={floatToIdCurrency(summary.total_instalment_payments_this_month)}
                    icon={<Gift className="w-20 h-20 text-yellow-100" />}
                    color="yellow"
                    subfooter={
                        <div className="text-xs text-muted-foreground mt-1">
                            Pembayaran pinjaman
                        </div>
                    }
                />

                <DynamicCard
                    title="Rata-rata per Karyawan"
                    value={floatToIdCurrency(summary.average_salary_per_employee)}
                    icon={<Award className="w-20 h-20 text-blue-100" />}
                    color="blue"
                    subfooter={
                        <div className="text-xs text-muted-foreground mt-1">
                            Gaji rata-rata bulan ini
                        </div>
                    }
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Salary Trend Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tren Gaji & THR 6 Bulan Terakhir</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            THR ditampilkan untuk tahun {summary.current_year}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Chart
                            options={salaryTrendOptions}
                            series={salaryTrendSeries}
                            type="area"
                            height={350}
                        />
                    </CardContent>
                </Card>

                {/* Salary by Position Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribusi Gaji per Jabatan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Chart
                            options={positionOptions}
                            series={positionSeries}
                            type="donut"
                            height={350}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Daily Activity Chart */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>
                        Aktivitas Gaji & Kehadiran 7 Hari Terakhir
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Menampilkan pembayaran gaji harian dan tingkat kehadiran
                        karyawan
                    </p>
                </CardHeader>
                <CardContent>
                    <Chart
                        options={dailyActivityOptions}
                        series={dailyActivitySeries}
                        type="line"
                        height={350}
                    />
                </CardContent>
            </Card>

            {/* Top Employees Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Top 5 Karyawan dengan Total Pengeluaran Tertinggi Bulan Ini
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Termasuk gaji bersih dan angsuran yang dibayarkan perusahaan
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        Ranking
                                    </TableHead>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        NIP
                                    </TableHead>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        Nama Karyawan
                                    </TableHead>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        Gaji Bersih
                                    </TableHead>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        Angsuran
                                    </TableHead>
                                    <TableHead className="bg-amber-200 font-semibold">
                                        Total Pengeluaran
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {top_employees.map((employee, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="text-center font-bold">
                                            <span
                                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white ${
                                                    idx === 0
                                                        ? "bg-yellow-500"
                                                        : idx === 1
                                                        ? "bg-gray-400"
                                                        : idx === 2
                                                        ? "bg-yellow-600"
                                                        : "bg-blue-500"
                                                }`}
                                            >
                                                {idx + 1}
                                            </span>
                                        </TableCell>
                                        <TableCell>{employee.nip}</TableCell>
                                        <TableCell className="font-medium">
                                            {employee.name}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {floatToIdCurrency(employee.net_salary)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {floatToIdCurrency(employee.instalment_payment)}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {floatToIdCurrency(employee.total)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
};

export default Dashboard;
