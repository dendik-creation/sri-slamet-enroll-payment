import { ymdToIdDate } from "@/Components/helper/helper";
import { SalarySlipEnvelopePrintProps } from "@/types/salaries";
import React, { useEffect } from "react";

const SalarySlipEnvelopePrint = ({
    title,
    description,
    employees,
}: SalarySlipEnvelopePrintProps) => {
    useEffect(() => {
        const handleNavigateBack = () => {
            try {
                if (window.history.length > 1) window.history.back();
                else if (window.opener) window.close();
            } catch (e) {
                console.warn("Navigation fallback failed:", e);
            }
        };

        const handleAfterPrint = () => handleNavigateBack();
        window.addEventListener("afterprint", handleAfterPrint);

        let mql: MediaQueryList | null = null;
        const onMedia = (e: MediaQueryListEvent) => {
            if (!e.matches) handleNavigateBack();
        };

        if (typeof window.matchMedia === "function") {
            mql = window.matchMedia("print");
            try {
                (mql as any).addEventListener
                    ? mql.addEventListener("change", onMedia)
                    : (mql as any).addListener(onMedia);
            } catch (e) {
                console.warn("MediaQuery listener setup failed:", e);
            }
        }

        const t = setTimeout(() => {
            try {
                window.print();
            } catch (e) {
                console.warn("Auto print failed:", e);
            }
        }, 300);

        return () => {
            clearTimeout(t);
            window.removeEventListener("afterprint", handleAfterPrint);
            if (mql) {
                try {
                    (mql as any).removeEventListener
                        ? mql.removeEventListener("change", onMedia)
                        : (mql as any).removeListener(onMedia);
                } catch (e) {
                    console.warn("MediaQuery cleanup failed:", e);
                }
            }
        };
    }, []);

    const companyName = description || "CV Sri Slamet";
    const companyAddress = "Jl.KH.Agus Salim 170";

    return (
        <div>
            <style>{`
        @page {
          size: 155mm 87mm landscape;
          margin: 0;
        }

        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 155mm !important;
            height: 87mm !important;
            background: #fff !important;
          }
          body { overflow: hidden !important; }
        }

        .envelope-container {
          width: 155mm;
          height: 87mm;
          position: relative;
        }

        .envelope-sheet {
          page-break-after: always;
          page-break-inside: avoid;
          width: 155mm;
          height: 87mm;
          padding: 10mm;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: space-between; /* kunci: atas & bawah */
          align-items: flex-start;
        }
        .envelope-sheet:last-child { page-break-after: auto; }

        .envelope-content { max-width: 70mm; }

        .company-name { font-weight: 700; font-size: 14pt; margin-bottom: 2mm; }
        .company-address { font-size: 10pt; margin-bottom: 4mm; color: #333; }
        .salary-period { font-size: 11pt; font-weight: 500; margin-bottom: 2mm; }
        .salary-date { font-size: 10pt; color: #444; }

        .signature-area { max-width: 70mm; }
        .signature-line { border-top: 1px solid #222; margin: 0 0 2mm 0; width: 100%; }
        .employee-name { font-weight: 600; font-size: 12pt; text-transform: uppercase; }

        @media screen {
          .envelope-container { margin: 20px auto; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
          .envelope-sheet { border: 1px solid #ccc; }
        }
      `}</style>

            <div className="envelope-container">
                {employees.map((employee, idx) => {
                    const isWeekly =
                        typeof employee.period_start === "string" ||
                        typeof employee.period_end === "string";

                    return (
                        <section
                            className="envelope-sheet"
                            key={employee.id ?? `emp-${idx}`}
                        >
                            <div className="envelope-content">
                                <div className="company-name">
                                    {companyName}
                                </div>
                                <div className="company-address">
                                    {companyAddress}
                                </div>

                                {isWeekly ? (
                                    <div className="salary-period">
                                        Gaji Mingguan
                                        {employee.period_start &&
                                        employee.period_end ? (
                                            <div className="salary-date">
                                                {ymdToIdDate(
                                                    employee.period_start
                                                )}{" "}
                                                -{" "}
                                                {ymdToIdDate(
                                                    employee.period_end
                                                )}
                                            </div>
                                        ) : (
                                            <div className="salary-date">
                                                (Periode tidak tersedia)
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="salary-period">
                                            Gaji Bulanan STAFF
                                        </div>
                                        <div className="salary-date">
                                            01 {employee.selected_month}{" "}
                                            {employee.selected_year}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="signature-area">
                                <div className="signature-line"></div>
                                <div className="employee-name">
                                    {employee.nip} - {employee.name}
                                </div>
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
};

export default SalarySlipEnvelopePrint;
