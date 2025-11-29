import { PageTitleProps } from "@/Partials/PageTitle";
import { Employee } from "./employee";

export type ExpenseFilters = {
    start_date: string;
    end_date: string;
};

export type ExpenseSummary = {
    total_expense: number;
    total_salary_expense: number;
    total_instalment_expense: number;
    total_thr_expense: number;
    total_basic_salary: number;
    total_overtime_salary: number;
    total_deductions: number;
    employee_count: number;
    salary_transactions: number;
    thr_transactions: number;
    average_per_employee: number;
    previous_total: number;
    percentage_change: number;
};

export type ExpenseByEmployee = {
    employee: Employee;
    total_net_salary: number;
    total_basic_salary: number;
    total_overtime_salary: number;
    total_deductions: number;
    total_instalment_payments: number;
    salary_count: number;
    thr_amount: number;
    total_expense: number;
};

export type ExpenseByDate = {
    date: string;
    total_expense: number;
    salary_expense: number;
    instalment_expense: number;
    thr_expense: number;
    employee_count: number;
};

export type ExpenseIndexProps = PageTitleProps & {
    filters: ExpenseFilters;
    summary: ExpenseSummary;
    expense_by_employee: ExpenseByEmployee[];
    expense_by_date: ExpenseByDate[];
};
