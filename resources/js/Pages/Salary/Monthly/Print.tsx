import { floatToIdCurrency, ymdToIdDate } from "@/Components/helper/helper";
import { SalaryMonthlyPrintProps } from "@/types/salaries";
import React from "react";
import DotMatrixLayout from "@/Partials/DotMatrixLayout";
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

const SalaryMonthlyPrint = ({
    title,
    description,
    salaries,
    month,
    year,
    total_remaining_instalment,
}: SalaryMonthlyPrintProps) => {
    const subheader = (
        <>
            <strong>Untuk Bulan:</strong>{" "}
            <span style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                {months.find((m) => m.value === month.toString())?.label ||
                    month}{" "}
                {year}
            </span>
        </>
    );
    // Aggregate sums for monthly print footer
    const totalGajiBulanan = Number(
        salaries.reduce(
            (sum, s) => Number(sum + (s.employee?.salary_per_month || 0)),
            0,
        ),
    );
    const totalJamsos = Number(
        salaries.reduce(
            (sum, s) =>
                sum +
                (s.deductions
                    ? s.deductions.reduce(
                          (t, d) => Number(t + (d.amount || 0)),
                          0,
                      )
                    : 0),
            0,
        ),
    );
    const totalLembur = Number(
        salaries.reduce((sum, s) => Number(sum + (s.overtime_salary || 0)), 0),
    );
    const totalAngsuran = Number(
        salaries.reduce(
            (sum, s) =>
                Number(sum + Number(s.instalment_payment?.payment_value || 0)),
            0,
        ),
    );
    const totalKeseluruhan = Number(
        salaries.reduce((sum, s) => Number(sum + (s.net_salary || 0)), 0) +
            Number(totalAngsuran),
    );

    const subfooter = (
        <div>
            <div style={{ marginBottom: 8 }}>
                <span>
                    Dicetak pada: {ymdToIdDate(new Date().toISOString(), true)}
                </span>
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12,
                    alignItems: "start",
                }}
            >
                <div>
                    <div style={{ marginBottom: 6 }}>
                        <strong>Total Gaji Bulanan:</strong>{" "}
                        {floatToIdCurrency(totalGajiBulanan)}
                    </div>
                    <div>
                        <strong>Total Lembur:</strong>{" "}
                        {floatToIdCurrency(totalLembur)}
                    </div>
                </div>

                <div>
                    <div style={{ marginBottom: 6 }}>
                        <strong>Total Jamsostek:</strong>{" "}
                        {floatToIdCurrency(totalJamsos)}
                    </div>
                    <div>
                        <strong>Total Angsuran:</strong>{" "}
                        {floatToIdCurrency(totalAngsuran)}
                    </div>
                </div>

                <div style={{ textAlign: "right" }}>
                    <div style={{ marginBottom: 6 }}>
                        <strong>Total Keseluruhan:</strong>{" "}
                        <strong>{floatToIdCurrency(totalKeseluruhan)}</strong>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <DotMatrixLayout
            title={title}
            description={description}
            subheader={subheader}
            subfooter={subfooter}
        >
            <table
                style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    marginBottom: 24,
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: 13,
                    background: "#fff",
                }}
            >
                <thead>
                    <tr>
                        <th
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            No
                        </th>
                        <th
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            NIP
                        </th>
                        <th
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Nama
                        </th>
                        <th
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Jml Hari Kerja
                        </th>
                        <th
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Gaji Bulanan
                        </th>
                        <th
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Jamsos
                        </th>
                        <th
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Angsur
                        </th>
                        <th
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Bonus
                        </th>
                        <th
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Total Gaji
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {(salaries && salaries.length > 0
                        ? salaries
                        : salaries
                    ).map((salary, idx) => (
                        <tr key={salary.id || idx}>
                            <td
                                style={{
                                    border: "2px solid #ccc",
                                    padding: 8,
                                    textAlign: "center",
                                }}
                            >
                                {idx + 1}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #ccc",
                                    padding: 8,
                                }}
                            >
                                {salary.employee.nip}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #ccc",
                                    padding: 8,
                                }}
                            >
                                {salary.employee.name}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #ccc",
                                    padding: 8,
                                    textAlign: "center",
                                }}
                            >
                                {salary.total_work_days}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #ccc",
                                    padding: 8,
                                    textAlign: "right",
                                }}
                            >
                                {floatToIdCurrency(
                                    salary.employee.salary_per_month || 0,
                                )}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #ccc",
                                    padding: 8,
                                    textAlign: "right",
                                }}
                            >
                                {floatToIdCurrency(
                                    salary.deductions?.reduce(
                                        (total, deduction) =>
                                            total + (deduction.amount || 0),
                                        0,
                                    ) || 0,
                                )}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #ccc",
                                    padding: 8,
                                    textAlign: "right",
                                }}
                            >
                                {floatToIdCurrency(
                                    salary.instalment_payment?.payment_value ||
                                        0,
                                )}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #ccc",
                                    padding: 8,
                                    textAlign: "right",
                                }}
                            >
                                {floatToIdCurrency(
                                    salary.bonuses?.reduce(
                                        (total, bonus) =>
                                            total + (bonus.amount || 0),
                                        0,
                                    ) || 0,
                                )}
                            </td>
                            <td
                                style={{
                                    border: "2px dashed #ccc",
                                    padding: 8,
                                    textAlign: "right",
                                }}
                            >
                                {floatToIdCurrency(salary.net_salary)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </DotMatrixLayout>
    );
};

export default SalaryMonthlyPrint;
