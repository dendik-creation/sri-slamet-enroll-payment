import React from "react";
import { floatToIdCurrency, ymdToIdDate } from "@/Components/helper/helper";
import { SalarySlipPrintAllProps } from "@/types/salaries";

interface SalarySlipDotMatrixItemProps {
    salary: SalarySlipPrintAllProps["salaries"][number];
    companyName?: string;
    printDate?: string;
}

const SalarySlipDotMatrixItem: React.FC<SalarySlipDotMatrixItemProps> = ({
    salary,
    companyName = "Nama CV",
    printDate,
}) => {
    console.log(salary);
    return (
        <div
            className="thermal-receipt"
            style={{
                width: "100%",
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: 12,
                padding: 8,
                marginBottom: 16,
                border: "none",
            }}
        >
            <style>{`
                /* Print tuning for 80mm thermal printers */
                @media print {
                    @page {
                        /* Let height be auto so receipt length adjusts */
                        size: 80mm 297mm;
                        margin: 2mm;
                        orientation : portrait;
                    }
                    html, body {
                        width: 80mm;
                        margin: 0;
                        padding: 0;
                        font-size: 12pt; /* more reliable for printers */
                        color: #000 !important;
                        background: #fff !important;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .thermal-receipt {
                        width: 76mm !important;
                        max-width: 76mm !important;
                        font-size: 12pt !important; /* increase from px to pt */
                        line-height: 1.4 !important; /* slightly taller for clarity */
                        letter-spacing: 0.1pt !important; /* improve legibility on dot-matrix */
                        margin: 0 !important;
                        padding: 2mm !important;
                        color: #000 !important;
                        background: #fff !important;
                        page-break-after: always;
                    }
                    .thermal-receipt:last-child { page-break-after: auto; }

                    .thermal-receipt table {
                        width: 100% !important;
                        font-size: 11pt !important; /* was 10px */
                        border-collapse: collapse !important;
                    }
                    .thermal-receipt table td { padding: 1.5pt 2pt !important; }

                    .thermal-receipt .header-title {
                        font-size: 16pt !important; /* stronger title */
                        font-weight: 700 !important;
                        letter-spacing: 0.2pt !important;
                        color: #000 !important;
                    }
                    .thermal-receipt .section-title {
                        font-size: 12.5pt !important;
                        font-weight: 700 !important;
                        letter-spacing: 0.15pt !important;
                        color: #000 !important;
                    }
                    .thermal-receipt .amount-final {
                        font-size: 14.5pt !important;
                        font-weight: 700 !important;
                        letter-spacing: 0.2pt !important;
                        color: #000 !important;
                    }

                    /* Solid separators print better than dashed */
                    .thermal-receipt .separator-top { border-top: 1.2pt solid #000 !important; }
                    .thermal-receipt .separator-bottom { border-bottom: 1.2pt solid #000 !important; }
                    .thermal-receipt .heavy-top { border-top: 2pt solid #000 !important; }
                }
                @media screen {
                    .thermal-receipt {
                        max-width: 300px;
                        margin: 0 auto;
                        border: 1px solid #ddd;
                        background: white;
                    }
                }
            `}</style>
            {/* Header */}
            <div
                className="header-title separator-bottom"
                style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: 14,
                    marginBottom: 8,
                    borderBottom: "1px dashed #000",
                    paddingBottom: 4,
                }}
            >
                SLIP GAJI
            </div>
            <div
                style={{
                    textAlign: "center",
                    marginBottom: 4,
                }}
            >
                {companyName}
            </div>
            <div
                className="separator-bottom"
                style={{
                    textAlign: "center",
                    marginBottom: 12,
                    borderBottom: "1px dashed #000",
                    paddingBottom: 8,
                    fontSize: 13,
                }}
            >
                {printDate || ymdToIdDate(new Date().toISOString(), true)}
            </div>

            {/* Employee Basic Information */}
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 11,
                    marginBottom: 12,
                }}
            >
                <tbody>
                    <tr>
                        <td style={{ padding: "2px 4px", width: "35%" }}>
                            Nama
                        </td>
                        <td style={{ padding: "2px 4px" }}>:</td>
                        <td style={{ padding: "2px 4px" }}>
                            {salary.employee.name}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: "2px 4px" }}>NIP</td>
                        <td style={{ padding: "2px 4px" }}>:</td>
                        <td style={{ padding: "2px 4px" }}>
                            {salary.employee.nip}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: "2px 4px" }}>Unit</td>
                        <td style={{ padding: "2px 4px" }}>:</td>
                        <td style={{ padding: "2px 4px" }}>
                            {salary.employee.position?.name || "-"}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: "2px 4px" }}>Hari Kerja</td>
                        <td style={{ padding: "2px 4px" }}>:</td>
                        <td style={{ padding: "2px 4px" }}>
                            {salary.total_work_days}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: "2px 4px" }}>
                            {salary.employee.salary_type == "daily"
                                ? "Gaji Harian"
                                : "Gaji Bulanan"}
                        </td>
                        <td style={{ padding: "2px 4px" }}>:</td>
                        <td style={{ padding: "2px 4px" }}>
                            {salary.employee.salary_type == "daily"
                                ? floatToIdCurrency(
                                      salary.employee.salary_per_day
                                  )
                                : floatToIdCurrency(
                                      salary.employee.salary_per_month || 0
                                  )}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Salary Details */}
            <div
                style={{
                    borderTop: "1px dashed #000",
                    paddingTop: 8,
                    marginBottom: 8,
                }}
                className="separator-top"
            >
                <div
                    className="section-title"
                    style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        marginBottom: 8,
                        fontSize: 12,
                    }}
                >
                    RINCIAN GAJI
                </div>

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 11,
                        marginBottom: 8,
                    }}
                >
                    <tbody>
                        <tr>
                            <td style={{ padding: "2px 4px", width: "50%" }}>
                                Gaji Pokok
                            </td>
                            <td style={{ padding: "2px 4px" }}>:</td>
                            <td
                                style={{
                                    padding: "2px 4px",
                                    textAlign: "right",
                                }}
                            >
                                {floatToIdCurrency(salary.basic_salary)}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: "2px 4px", width: "50%" }}>
                                Gaji Lembur
                            </td>
                            <td style={{ padding: "2px 4px" }}>:</td>
                            <td
                                style={{
                                    padding: "2px 4px",
                                    textAlign: "right",
                                }}
                            >
                                {floatToIdCurrency(salary.overtime_salary)}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: "2px 4px" }}>Bonus</td>
                            <td style={{ padding: "2px 4px" }}>:</td>
                            <td
                                style={{
                                    padding: "2px 4px",
                                    textAlign: "right",
                                }}
                            >
                                {floatToIdCurrency(
                                    salary.bonuses?.reduce(
                                        (acc, bonus) => acc + bonus.amount,
                                        0
                                    ) ?? 0
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Deductions */}
                {(salary.deductions && salary.deductions.length > 0) ||
                salary.instalment_payment ? (
                    <div
                        style={{
                            borderTop: "1px dashed #000",
                            paddingTop: 8,
                            marginBottom: 8,
                        }}
                        className="separator-top"
                    >
                        <div
                            className="section-title"
                            style={{
                                textAlign: "center",
                                fontWeight: "bold",
                                marginBottom: 8,
                                fontSize: 12,
                            }}
                        >
                            POTONGAN
                        </div>

                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: 11,
                                marginBottom: 8,
                            }}
                        >
                            <tbody>
                                {salary.deductions?.map((deduction) => (
                                    <tr key={deduction.id}>
                                        <td
                                            style={{
                                                padding: "2px 4px",
                                                width: "50%",
                                            }}
                                        >
                                            {deduction.deduction.name}
                                        </td>
                                        <td style={{ padding: "2px 4px" }}>
                                            :
                                        </td>
                                        <td
                                            style={{
                                                padding: "2px 4px",
                                                textAlign: "right",
                                            }}
                                        >
                                            {floatToIdCurrency(
                                                deduction.amount
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {salary.instalment_payment && (
                                    <tr>
                                        <td style={{ padding: "2px 4px" }}>
                                            Angsuran Ke-{" "}
                                            {salary.instalment_payment.step}
                                        </td>
                                        <td style={{ padding: "2px 4px" }}>
                                            :
                                        </td>
                                        <td
                                            style={{
                                                padding: "2px 4px",
                                                textAlign: "right",
                                            }}
                                        >
                                            {floatToIdCurrency(
                                                salary.instalment_payment
                                                    ?.payment_value ?? 0
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : null}

                {/* Net Salary */}
                <div
                    className="section-title heavy-top"
                    style={{
                        borderTop: "2px solid #000",
                        paddingTop: 8,
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: 12,
                    }}
                >
                    GAJI DITERIMA
                </div>
                <div
                    className="amount-final separator-bottom"
                    style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: 14,
                        marginTop: 4,
                        borderBottom: "1px dashed #000",
                        paddingBottom: 8,
                    }}
                >
                    {floatToIdCurrency(salary.net_salary)}
                </div>
            </div>
        </div>
    );
};

export default SalarySlipDotMatrixItem;
