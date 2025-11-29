import { floatToIdCurrency, ymdToIdDate } from "@/Components/helper/helper";
import { EmployeeDeductionPrintProps } from "@/types/salaries";
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

const EmployeeDeductionPrint = ({
    title,
    description,
    salary_deduction,
    employee_deductions,
    year,
    month,
}: EmployeeDeductionPrintProps) => {
    const subheader = (
        <>
            <span>Bulan:</span>{" "}
            <span style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                {months.find((m) => m.value === month)?.label ||
                    "Tidak Diketahui"}{" "}
                {year ? `Tahun: ${year}` : ""}
            </span>
        </>
    );
    const deductionTotal = floatToIdCurrency(
        employee_deductions.reduce(
            (total, deduction) => total + deduction.amount,
            0
        )
    );

    const subfooter = (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
                <span>Dicetak pada: {ymdToIdDate(new Date().toISOString(), true)}</span>
            </div>
            <div style={{ textAlign: "right" }}>
                <div style={{ marginBottom: 8 }}>
                    <strong>Total Potongan:</strong> {deductionTotal}
                </div>
            </div>
        </div>
    );

    return (
        <DotMatrixLayout title={title} description={description} subheader={subheader} subfooter={subfooter}>
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
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
                                border: "1px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            No
                        </th>
                        <th
                            style={{
                                border: "1px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            NIP
                        </th>
                        <th
                            style={{
                                border: "1px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Karyawan
                        </th>
                        <th
                            style={{
                                border: "1px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Tanggal Pembayaran
                        </th>
                        <th
                            style={{
                                border: "1px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Nominal Potongan
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {(employee_deductions && employee_deductions.length > 0
                        ? employee_deductions
                        : employee_deductions
                    ).map((emp_deduction, idx) => (
                        <tr key={emp_deduction.id || idx}>
                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: 8,
                                    textAlign: "center",
                                }}
                            >
                                {idx + 1}
                            </td>
                            <td
                                style={{ border: "1px solid #ccc", padding: 8 }}
                            >
                                {emp_deduction.employee.nip}
                            </td>
                            <td
                                style={{ border: "1px solid #ccc", padding: 8 }}
                            >
                                {emp_deduction.employee.name}
                            </td>
                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: 8,
                                    textAlign: "right",
                                }}
                            >
                                {ymdToIdDate(emp_deduction.created_at)}
                            </td>
                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: 8,
                                    textAlign: "right",
                                }}
                            >
                                {floatToIdCurrency(emp_deduction.amount)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </DotMatrixLayout>
    );
};

export default EmployeeDeductionPrint;
