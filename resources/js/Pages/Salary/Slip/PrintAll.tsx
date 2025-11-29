import { floatToIdCurrency, ymdToIdDate } from "@/Components/helper/helper";
import { SalarySlipPrintAllProps } from "@/types/salaries";
import React from "react";
import DotMatrixLayout from "@/Partials/DotMatrixLayout";
import SalarySlipDotMatrixItem from "./SalarySlipDotMatrixItem";

const SalarySlipPrintAll = ({
    title,
    description,
    salaries,
}: SalarySlipPrintAllProps) => {
    const subheader = (
        <>
            <strong>Total karyawan yang digaji :</strong>{" "}
            <span style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                {salaries.length}
            </span>
        </>
    );

    const salaryTotal = floatToIdCurrency(
        salaries.reduce((total, salary) => total + salary.net_salary, 0)
    );

    return (
        <DotMatrixLayout
            title={title}
            description={description}
            subheader={subheader}
            skipHeader={true}
            skipFooter={true}
            salary_total={salaryTotal}
        >
            {salaries.map((salary, idx) => (
                <SalarySlipDotMatrixItem
                    key={salary.id || idx}
                    salary={salary}
                    companyName="CV Sri Slamet"
                />
            ))}
        </DotMatrixLayout>
    );
};

export default SalarySlipPrintAll;
