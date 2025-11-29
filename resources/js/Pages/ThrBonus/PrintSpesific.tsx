import { floatToIdCurrency, ymdToIdDate } from "@/Components/helper/helper";
import DotMatrixLayout from "@/Partials/DotMatrixLayout";
import { ThrBonusPrintSpecificProps } from "@/types/thr_bonus";
import React from "react";

const PrintSpesific = ({
    title,
    description,
    employee_thr,
    company_name,
    back_url,
}: ThrBonusPrintSpecificProps) => {
    return (
        <DotMatrixLayout
            title={title}
            skipHeader={true}
            description={description}
            wrapWithBorder={false}
            skipFooter={true}
            subfooter={null}
        >
            <div
                className="thermal-receipt"
                style={{
                    width: "100%",
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: 12,
                    padding: 8,
                }}
            >
                <style>{`
                    @media print {
                        @page {
                            size: 80mm 297mm;
                            margin: 2mm;
                            orientation: portrait;
                        }
                        html, body {
                            width: 80mm;
                            margin: 0;
                            padding: 0;
                            font-size: 12px;
                        }
                        * {
                            -webkit-print-color-adjust: exact !important;
                            color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .thermal-receipt {
                            width: 76mm !important;
                            max-width: 76mm !important;
                            font-size: 12px !important;
                            line-height: 1.3 !important;
                            margin: 0 !important;
                            padding: 2mm !important;
                        }
                        .thermal-receipt table {
                            width: 100% !important;
                            font-size: 10px !important;
                        }
                        .thermal-receipt .header-title {
                            font-size: 14px !important;
                            font-weight: bold !important;
                        }
                        .thermal-receipt .section-title {
                            font-size: 11px !important;
                            font-weight: bold !important;
                        }
                        .thermal-receipt .amount-final {
                            font-size: 13px !important;
                            font-weight: bold !important;
                        }
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
                    className="header-title"
                    style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: 14,
                        marginBottom: 8,
                        borderBottom: "1px dashed #000",
                        paddingBottom: 4,
                    }}
                >
                    SLIP THR
                </div>
                <div
                    style={{
                        textAlign: "center",
                        marginBottom: 12,
                        borderBottom: "1px dashed #000",
                        paddingBottom: 8,
                    }}
                >
                    {company_name}
                </div>

                {/* Employee Information */}
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
                                {employee_thr.employee?.name}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: "2px 4px" }}>NIP</td>
                            <td style={{ padding: "2px 4px" }}>:</td>
                            <td style={{ padding: "2px 4px" }}>
                                {employee_thr.employee?.nip}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: "2px 4px" }}>Unit</td>
                            <td style={{ padding: "2px 4px" }}>:</td>
                            <td style={{ padding: "2px 4px" }}>
                                {employee_thr?.employee?.position?.name || "-"}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: "2px 4px" }}>Tgl gabung</td>
                            <td style={{ padding: "2px 4px" }}>:</td>
                            <td style={{ padding: "2px 4px" }}>
                                {ymdToIdDate(
                                    employee_thr?.employee?.join_date.toString() ||
                                        new Date().toISOString()
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* THR Amount */}
                <div
                    className="section-title"
                    style={{
                        borderTop: "1px dashed #000",
                        paddingTop: 8,
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: 12,
                    }}
                >
                    THR DITERIMA
                </div>
                <div
                    className="amount-final"
                    style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: 14,
                        marginTop: 4,
                        borderBottom: "1px dashed #000",
                        paddingBottom: 8,
                    }}
                >
                    {floatToIdCurrency(employee_thr.amount)}
                </div>
            </div>
        </DotMatrixLayout>
    );
};

export default PrintSpesific;
