import { floatToIdCurrency, ymdToIdDate } from "@/Components/helper/helper";
import { InstalmentPrintProps } from "@/types/instalment";
import React from "react";
import DotMatrixLayout from "@/Partials/DotMatrixLayout";

const InstalmentPrint = ({
    title,
    description,
    instalment,
}: InstalmentPrintProps) => {
    const subheader = (
        <>
            <span>Karyawan:</span>{" "}
            <span style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                {instalment.employee.name} (NIP: {instalment.employee.nip})
            </span>
        </>
    );

    const subfooter = (
        <>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginTop: 32,
                }}
            >
                <div style={{ textAlign: "left" }}>
                    <span>
                        Dicetak pada:{" "}
                        {ymdToIdDate(new Date().toISOString(), true)}{" "}
                    </span>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ marginBottom: 8 }}>
                        <strong>Total Diambil:</strong>{" "}
                        {floatToIdCurrency(instalment.total_amount)}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <strong>Angsuran Belum Dibayar:</strong>{" "}
                        {floatToIdCurrency(instalment.remaining_amount)}
                    </div>
                </div>
            </div>
        </>
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
                            Angsuran Ke-
                        </th>
                        <th
                            style={{
                                border: "1px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Nominal
                        </th>
                        <th
                            style={{
                                border: "1px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Sumber
                        </th>
                        <th
                            style={{
                                border: "1px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Tanggal
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {(instalment.payments || []).map((payment, idx) => (
                        <tr key={payment.id || idx}>
                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: 8,
                                    textAlign: "center",
                                }}
                            >
                                {payment.step}
                            </td>
                            <td
                                style={{ border: "1px solid #ccc", padding: 8 }}
                            >
                                {floatToIdCurrency(payment.payment_value)}
                            </td>
                            <td
                                style={{ border: "1px solid #ccc", padding: 8 }}
                            >
                                {payment.payment_source == "salary"
                                    ? "Potongan Gaji"
                                    : "Langsung / Terdahulu"}
                            </td>
                            <td
                                style={{ border: "1px solid #ccc", padding: 8 }}
                            >
                                {ymdToIdDate(payment.paid_at)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </DotMatrixLayout>
    );
};

export default InstalmentPrint;
