import { floatToIdCurrency, ymdToIdDate } from "@/Components/helper/helper";
import { SalarySlipPrintSpesificProps } from "@/types/salaries";
import React from "react";
import DotMatrixLayout from "@/Partials/DotMatrixLayout";
import SalarySlipDotMatrixItem from "./SalarySlipDotMatrixItem";

const SalarySlipPrintSpesific = ({
    title,
    description,
    salary,
}: SalarySlipPrintSpesificProps) => {
    return (
        <DotMatrixLayout
            title={title}
            description={description}
            skipFooter={true}
            skipHeader={true}
        >
            <SalarySlipDotMatrixItem
                companyName={"CV Sri Slamet"}
                salary={salary}
            />
        </DotMatrixLayout>
    );
};

export default SalarySlipPrintSpesific;
