import { PageTitleProps } from "@/Partials/PageTitle";
import { Employee } from "@/types/employee";
import { PaginationData, SelectOption } from "./global";

export type Instalment = {
    id: number;
    employee_id: number;
    total_amount: number;
    instalment_value: number;
    remaining_amount: number;
    taken_at: string;
    payments?: InstalmentPayment[];
    employee: Employee;
};

export type InstalmentPayment = {
    id: number;
    instalment_id: number;
    payment_value: number;
    paid_at: string;
    step: number;
    payment_source?: "salary" | "direct";
    instalment: Instalment;
};

export type InstalmentIndexProps = PageTitleProps & {
    instalments: PaginationData<Instalment>;
    filters: {
        employee_search: string;
    };
};

export type InstalmentShowProps = PageTitleProps & {
    instalment: Instalment;
};

export type InstalmentCreateProps = PageTitleProps & {
    employees: SelectOption[];
};

export type InstalmentPrintLeggerProps = PageTitleProps & {
    instalments: Instalment[];
    filters: {
        legger_mode: "DATE_RANGE" | "MONTHLY";
        latest_date?: string;
        month?: string;
        year?: string;
    };
};

export type InstalmentPaymentFormData = {
    id?: number;
    payment_value?: number;
    paid_at?: string;
    payment_source?: "salary" | "direct";
    instalment_id?: number;
};

export type InstalmentFormData = {
    employee_id?: number;
    total_amount?: number;
    instalment_value?: number;
    direct_instalment_payments?: InstalmentPaymentFormData[];
};

export type InstalmentPrintProps = PageTitleProps & {
    instalment: Instalment;
};

export type InstalmentEditProps = PageTitleProps & {
    instalment: Instalment;
    employees: SelectOption[];
};
