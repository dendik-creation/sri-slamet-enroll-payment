import { floatToIdCurrency, ymdToIdDate } from "@/Components/helper/helper";
import { SalaryDailyPrintProps } from "@/types/salaries";
import React from "react";
import DotMatrixLayout from "@/Partials/DotMatrixLayout";

const SalaryDailyPrint = ({
    title,
    description,
    salaries,
    start_date,
    end_date,
    total_remaining_instalment,
}: SalaryDailyPrintProps) => {
    const subheader = (
        <>
            <strong>Rentang tanggal:</strong>{" "}
            <span style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                {ymdToIdDate(start_date)} - {ymdToIdDate(end_date)}
            </span>
        </>
    );

    // Aggregate sums for daily print footer
    const totalGajiHarian = Number(
        salaries.reduce(
            (sum, s) => Number(sum + (s.employee?.salary_per_day || 0)),
            0
        )
    );
    const totalJamsos = Number(
        salaries.reduce(
            (sum, s) =>
                sum +
                (s.deductions
                    ? s.deductions.reduce(
                          (t, d) => Number(t + (d.amount || 0)),
                          0
                      )
                    : 0),
            0
        )
    );
    const totalLembur = Number(
        salaries.reduce((sum, s) => Number(sum + (s.overtime_salary || 0)), 0)
    );
    const totalBonus = Number(
        salaries.reduce(
            (sum, s) =>
                sum +
                (s.bonuses
                    ? s.bonuses.reduce((t, b) => Number(t + (b.amount || 0)), 0)
                    : 0),
            0
        )
    );
    const totalJumlahGaji = Number(
        salaries.reduce((sum, s) => Number(sum + (s.basic_salary || 0)), 0)
    );
    const totalAngsuran = Number(
        salaries.reduce(
            (sum, s) =>
                Number(sum + Number(s.instalment_payment?.payment_value || 0)),
            0
        )
    );
    const totalKeseluruhan = Number(
        salaries.reduce((sum, s) => Number(sum + (s.net_salary || 0)), 0) +
            Number(totalAngsuran)
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
                        <strong>Total Gaji Harian:</strong>{" "}
                        {floatToIdCurrency(totalGajiHarian)}
                    </div>
                    <div>
                        <strong>Total Jumlah Gaji:</strong>{" "}
                        {floatToIdCurrency(totalJumlahGaji)}
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
                        <strong>Total Lembur & Bonus:</strong>{" "}
                        {floatToIdCurrency(totalLembur + totalBonus)}
                    </div>
                    <div>
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
                            Gaji Harian
                        </th>
                        <th
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Jml Gaji
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
                            Lembur
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
                                    salary.employee.salary_per_day
                                )}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #ccc",
                                    padding: 8,
                                    textAlign: "right",
                                }}
                            >
                                {floatToIdCurrency(salary.basic_salary)}
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
                                        0
                                    ) || 0
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
                                        0
                                )}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #ccc",
                                    padding: 8,
                                    textAlign: "right",
                                }}
                            >
                                {floatToIdCurrency(salary.overtime_salary || 0)}
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
                                        0
                                    ) || 0
                                )}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #ccc",
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

export default SalaryDailyPrint;
