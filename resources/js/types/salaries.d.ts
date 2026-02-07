import { PageTitleProps } from "@/Partials/PageTitle";
import { Attendance } from "./atttendance";
import { Employee } from "./employee";
import { PaginationData, SelectOption } from "./global";
import { InstalmentPayment } from "./instalment";

export type SalaryDeduction = {
    id: number;
    name: string;
    amount: number;
    target_employee: "monthly" | "daily" | "all" | "specific";
    frequency?: "per_payrun" | "monthly_once";
    received_amount_total?: number;
    specific_employee_id?: number[] | null;
    specific_employees?: string[] | null;
};

export type SalaryView = {
    employee_id: number;
    employee: Employee;
    total_work_days: number;
    total_overtime_hours?: number | null;
    basic_salary: number;
    overtime_salary?: number;
    total_deduction: number;
    net_salary: number;
    instalment_deduction: number;
    instalment_status: {
        has_instalment: boolean;
        instalment_id: number;
        total_amount: number;
        instalment_value: number;
        remaining_amount: number;
        payment_amount: number;
        taken_at: string;
    };
};

export type SalaryBonus = {
    id: number;
    salary_id: number;
    amount: number;
    bonus_type: string;
};

export type EmployeeDeduction = {
    id: number;
    salary_id: number;
    deduction_id: number;
    amount: number;
    deduction: SalaryDeduction;
    month: number;
    year: number;
    created_at?: string;
    employee_id: number;
    employee: Employee;
};

export type SalaryFinal = {
    id: number;
    employee_id: number;
    salary_date: string;
    total_work_days: number;
    total_overtime_hours: number | null;
    basic_salary: number;
    overtime_salary: number;
    total_deduction: number;
    net_salary: number;
    employee: Employee;
    bonuses?: SalaryBonus[];
    instalment_payment?: InstalmentPayment;
    deductions?: EmployeeDeduction[];
};

export type SalaryBonusProps = {
    id?: number;
    salary_id: number;
    bonus_type: string;
    amount: number;
};

export type SalaryBonusFormProps = {
    bonus_type: string;
    amount?: number;
    target_employee?: "all" | "specific";
    employee_id?: number[];
};

export type SalaryDailyIndexProps = PageTitleProps & {
    salaries: PaginationData<SalaryView>;
    start_date: string;
    end_date: string;
    description: string;
    expected_employees: SelectOption[];
};

export type SalaryDailyPrintProps = PageTitleProps & {
    salaries: SalaryFinal[];
    start_date: string;
    end_date: string;
    total_remaining_instalment: number;
};

export type SalaryMonthlyIndexProps = PageTitleProps & {
    salaries: PaginationData<SalaryView>;
    month: string;
    year: string;
    description: string;
    expected_employees: SelectOption[];
};

export type SalaryMonthlyPrintProps = PageTitleProps & {
    salaries: SalaryFinal[];
    month: string;
    year: string;
    total_remaining_instalment: number;
};

export type SalarySlipViewProps = PageTitleProps & {
    employees: SelectOption[];
    salaries: PaginationData<SalaryFinal>;
    employee_id?: number;
    start_date?: string;
    end_date?: string;
    employee_type?: "daily" | "monthly";
};

export type SalarySlipShowProps = PageTitleProps & {
    salary: SalaryFinal;
    deductions: { name: string; amount: number }[];
    bonuses: { name: string; amount: number }[];
};

export type SalaryBonusEdit = {
    id: number | null;
    bonus_type: string;
    amount: number;
};

export type SalarySlipEditProps = PageTitleProps & {
    salary: SalaryFinal;
    deductions_list: SelectOption[];
};

export type SalarySlipPrintAllProps = PageTitleProps & {
    salaries: SalaryFinal[];
    employee_id?: number;
};

export type SalarySlipPrintSpesificProps = PageTitleProps & {
    salary: SalaryFinal;
};

export type SalarySlipEnvelopeIndexProps = PageTitleProps & {
    period_start: string;
    period_end: string;
    current_month: string;
};

export type SalarySlipEnvelopePrintProps = PageTitleProps & {
    employees: {
        id: number;
        name: string;
        nip: string;
        salary_type: "monthly" | "daily";
        period_start?: string;
        period_end?: string;
        selected_month?: string;
        selected_year?: string;
    }[];
};

export type EmployeeDeductionPrintProps = PageTitleProps & {
    salary_deduction: SalaryDeduction;
    employee_deductions: EmployeeDeduction[];
    month: string;
    year: string;
};
