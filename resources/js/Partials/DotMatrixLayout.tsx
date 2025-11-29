import { ymdToIdDate } from "@/Components/helper/helper";
import React, { useRef, useEffect } from "react";

interface DotMatrixLayoutProps {
    title?: string;
    description?: string;
    salary_total?: React.ReactNode;
    subheader?: React.ReactNode;
    subfooter?: React.ReactNode;
    children: React.ReactNode;
    skipHeader?: boolean;
    skipFooter?: boolean;
    wrapWithBorder?: boolean;
    quarterPageSize?: boolean;
}

const DotMatrixLayout: React.FC<DotMatrixLayoutProps> = ({
    title,
    description,
    salary_total,
    subheader,
    subfooter,
    children,
    skipHeader = false,
    skipFooter = false,
    wrapWithBorder = true,
    quarterPageSize = false,
}) => {
    const printAreaRef = useRef<HTMLDivElement>(null);
    const now = new Date();

    useEffect(() => {
        document.title = `${title}`;
    }, [title]);

    useEffect(() => {
        // Throttle window.print untuk mencegah "too frequent calls" error
        // Detect if browser is Chrome/Chromium (termasuk Electron)
        if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) {
            // wrap private vars in a closure
            (function () {
                const realPrintFunc = window.print;
                const interval = 1000; // 1 sec - lebih pendek untuk desktop app
                let nextAvailableTime = +new Date(); // when we can safely print again

                // overwrite window.print function
                window.print = function () {
                    const now = +new Date();
                    // if the next available time is in the past, print now
                    if (now > nextAvailableTime) {
                        realPrintFunc();
                        nextAvailableTime = now + interval;
                    } else {
                        // print when next available
                        setTimeout(realPrintFunc, nextAvailableTime - now);
                        nextAvailableTime += interval;
                    }
                };
            })();
        }

        let printStartTime: number;
        let isProcessingPrint = false;
        let hasNavigatedBack = false;

        const handleBeforePrint = () => {
            printStartTime = Date.now();
            isProcessingPrint = true;
        };

        const handleAfterPrint = () => {
            const printDuration = Date.now() - printStartTime;
            isProcessingPrint = false;

            // Hindari navigasi ganda
            if (hasNavigatedBack) return;
            hasNavigatedBack = true;

            if (printDuration < 500) {
                window.history.back();
            } else {
                setTimeout(() => {
                    window.history.back();
                }, 100);
            }
        };

        const triggerPrint = () => {
            if (isProcessingPrint) return;
            if (document.hidden) return;

            // Langsung panggil window.print() karena sudah di-throttle
            window.print();
        };

        window.addEventListener("beforeprint", handleBeforePrint);
        window.addEventListener("afterprint", handleAfterPrint);

        // Trigger print dialog saat component mount dengan delay singkat
        const printTimeout = setTimeout(() => {
            triggerPrint();
        }, 100);

        return () => {
            clearTimeout(printTimeout);
            window.removeEventListener("beforeprint", handleBeforePrint);
            window.removeEventListener("afterprint", handleAfterPrint);
        };
    }, []);

    return (
        <div>
            <style>{`
            @media print {
                @page {
                    size: A4 landscape;
                    margin: 12mm;
                }
                body * {
                    visibility: hidden !important;
                }
                #print-area, #print-area * {
                    visibility: visible !important;
                }
                #print-area {
                    position: absolute !important;
                    left: 0; top: 0;
                    width: ${quarterPageSize ? "148.5mm" : "100vw"};
                    height: ${quarterPageSize ? "105mm" : "auto"};
                    margin: 0 !important;
                    padding: 0 !important;
                    background: #fff !important;
                    box-shadow: none !important;
                    border: none !important;
                }
            }
        `}</style>
            <div
                id="print-area"
                ref={printAreaRef}
                style={{
                    padding: 24,
                    fontFamily: "'Courier New', Courier, monospace",
                    color: "#222",
                    background: "#fff",
                    fontSize: 13,
                    letterSpacing: 1,
                    lineHeight: 1.4,
                    maxWidth: quarterPageSize ? "148.5mm" : 1100,
                    width: quarterPageSize ? "148.5mm" : "auto",
                    height: quarterPageSize ? "105mm" : "auto",
                    margin: "0 auto",
                    border: wrapWithBorder ? "1px dashed #888" : "none",
                }}
            >
                {!skipHeader && (
                    <div className="">
                        <h1
                            style={{
                                textAlign: "center",
                                marginBottom: 4,
                                fontWeight: "bold",
                                fontSize: 18,
                                letterSpacing: 2,
                                textTransform: "uppercase",
                                borderBottom: "1px dashed #888",
                                paddingBottom: 4,
                            }}
                        >
                            {title || "Laporan Gaji Harian"}
                        </h1>
                        {description && (
                            <pre
                                style={{
                                    textAlign: "center",
                                    marginBottom: 16,
                                    background: "none",
                                    border: "none",
                                    fontFamily:
                                        "'Courier New', Courier, monospace",
                                    fontSize: 13,
                                    whiteSpace: "pre-wrap",
                                }}
                            >
                                {description}
                            </pre>
                        )}
                        {subheader && (
                            <div style={{ marginBottom: 8 }}>{subheader}</div>
                        )}
                    </div>
                )}
                {children}
                {!skipFooter && (
                    <div style={{ marginTop: 32 }}>
                        {subfooter ? (
                            // If caller provides full subfooter, render it as-is
                            <div>{subfooter}</div>
                        ) : (
                            // Sensible default footer: left printed date, right totals (if provided)
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-end",
                                }}
                            >
                                <div style={{ textAlign: "left" }}>
                                    <span>
                                        Dicetak pada:{" "}
                                        {ymdToIdDate(now.toISOString(), true)}
                                    </span>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    {salary_total && (
                                        <div style={{ marginBottom: 8 }}>
                                            <strong>
                                                Total Gaji Dikeluarkan:
                                            </strong>{" "}
                                            {salary_total}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DotMatrixLayout;
