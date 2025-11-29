import { floatToIdCurrency, ymdToIdDate } from "@/Components/helper/helper";
import React from "react";
import DotMatrixLayout from "@/Partials/DotMatrixLayout";
import { InstalmentPrintLeggerProps } from "@/types/instalment";
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

const InstalmentPrintLegger = ({
    title,
    description,
    instalments,
    filters,
}: InstalmentPrintLeggerProps) => {
    const subheader =
        filters.legger_mode == "DATE_RANGE" ? (
            <>
                <strong>Data terakhir per tanggal:</strong>{" "}
                <span
                    style={{ fontFamily: "'Courier New', Courier, monospace" }}
                >
                    {ymdToIdDate(filters.latest_date)}
                </span>
            </>
        ) : (
            <>
                <strong>Data terakhir per bulan :</strong>{" "}
                <span
                    style={{ fontFamily: "'Courier New', Courier, monospace" }}
                >
                    {
                        months.find((month) => month.value === filters.month)
                            ?.label
                    }{" "}
                    / {filters.year}
                </span>
            </>
        );

    const totalInstalments = Number(
        instalments.reduce(
            (total, instalment) =>
                Number(total) + Number(instalment.instalment_value),
            0
        )
    );

    const totalRemainingInstalments = Number(
        instalments.reduce(
            (total, instalment) =>
                Number(total) + Number(instalment.remaining_amount),
            0
        )
    );

    const expectedTotalInstalment = (
        total_instalment: Number,
        instalment_value: number
    ) => {
        const expectedTotal = Math.ceil(
            Number(total_instalment) / Number(instalment_value)
        );
        return expectedTotal;
    };

    return (
        <DotMatrixLayout
            title={title}
            description={description}
            subheader={subheader}
            skipFooter={true}
            quarterPageSize={true}
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
                            Nama
                        </th>
                        <th
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Pinjam
                        </th>
                        <th
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Total Angsur
                        </th>
                        <th
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Angsur ke
                        </th>
                        <th
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Angsur / minggu
                        </th>
                        <th
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Sisa angsur
                        </th>
                        <th
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Tgl Angsur 1x
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {(instalments && instalments.length > 0
                        ? instalments
                        : instalments
                    ).map((instalment, idx) => (
                        <tr key={instalment.id || idx}>
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
                                {instalment.employee.name}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #ccc",
                                    padding: 8,
                                    textAlign: "right",
                                }}
                            >
                                {floatToIdCurrency(instalment.total_amount)}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #ccc",
                                    padding: 8,
                                    textAlign: "right",
                                }}
                            >
                                {expectedTotalInstalment(
                                    Number(instalment.total_amount),
                                    Number(instalment.instalment_value)
                                )}
                                {"x"}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #ccc",
                                    padding: 8,
                                    textAlign: "right",
                                }}
                            >
                                {instalment.payments?.length}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #ccc",
                                    padding: 8,
                                    textAlign: "right",
                                }}
                            >
                                {floatToIdCurrency(instalment.instalment_value)}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #ccc",
                                    padding: 8,
                                    textAlign: "right",
                                }}
                            >
                                {floatToIdCurrency(instalment.remaining_amount)}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #ccc",
                                    padding: 8,
                                    textAlign: "right",
                                }}
                            >
                                {instalment?.payments &&
                                instalment.payments.length > 0
                                    ? ymdToIdDate(
                                          instalment.payments[0].paid_at
                                      )
                                    : "-"}
                            </td>
                        </tr>
                    ))}
                    {/* Accumulation */}
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td
                            colSpan={2}
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Jumlah :
                        </td>
                        <td
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            {floatToIdCurrency(Number(totalInstalments))}
                        </td>
                        <td
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            {floatToIdCurrency(
                                Number(totalRemainingInstalments)
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
        </DotMatrixLayout>
    );
};

export default InstalmentPrintLegger;
