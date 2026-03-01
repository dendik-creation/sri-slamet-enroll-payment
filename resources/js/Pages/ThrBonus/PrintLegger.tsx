import { floatToIdCurrency, ymdToIdDate } from "@/Components/helper/helper";
import DotMatrixLayout from "@/Partials/DotMatrixLayout";
import { ThrBonusPrintLeggerProps } from "@/types/thr_bonus";

const ThrPrintLegger = ({
    title,
    description,
    thr_bonus,
    company_name,
    back_url,
}: ThrBonusPrintLeggerProps) => {
    const subheader = (
        <>
            <strong>Data berdasarkan terakhir pada:</strong>{" "}
            <span style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                {ymdToIdDate(thr_bonus.paid_at, true)}
            </span>
        </>
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
                        <strong>Total THR Diberikan:</strong>{" "}
                        {floatToIdCurrency(thr_bonus.total_amount)}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <DotMatrixLayout
            title={title}
            description={"CV Sri Slamet"}
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
                            Jabatan
                        </th>
                        <th
                            style={{
                                border: "2px solid #888",
                                padding: "4px 6px",
                                background: "#f8f8f8",
                            }}
                        >
                            Nilai THR
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {thr_bonus.employee_thrs.map((thr, index) => (
                        <tr key={index}>
                            <td
                                style={{
                                    border: "2px solid #888",
                                    padding: "4px 6px",
                                    background: "#f8f8f8",
                                }}
                            >
                                {index + 1}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #888",
                                    padding: "4px 6px",
                                    background: "#f8f8f8",
                                }}
                            >
                                {thr.employee?.nip}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #888",
                                    padding: "4px 6px",
                                    background: "#f8f8f8",
                                }}
                            >
                                {thr.employee?.name}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #888",
                                    padding: "4px 6px",
                                    background: "#f8f8f8",
                                }}
                            >
                                {thr.employee?.position?.name}
                            </td>
                            <td
                                style={{
                                    border: "2px solid #888",
                                    padding: "4px 6px",
                                    background: "#f8f8f8",
                                }}
                            >
                                {floatToIdCurrency(thr.amount)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </DotMatrixLayout>
    );
};

export default ThrPrintLegger;
