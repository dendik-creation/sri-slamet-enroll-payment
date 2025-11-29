export type DashboardSummary = {
    total_employees: number;
    total_salaries_this_month: number;
    total_basic_salaries_this_month: number;
    total_overtime_salaries_this_month: number;
    total_deductions_this_month: number;
    total_instalment_payments_this_month: number;
    total_thr_this_year: number;
    total_combined_this_month: number;
    total_transactions_this_month: number;
    total_thr_transactions_this_year: number;
    average_salary_per_employee: number;
    percentage_change: number;
    current_month: string;
    current_year: number;
};

export type SalaryTrend = {
    month: string;
    total: number;
    instalment_total: number;
    thr_total: number;
    combined_total: number;
};

export type DailyActivity = {
    date: string;
    salary: number;
    attendance: number;
};

export type SalaryByPosition = {
    position: string;
    total: number;
    count: number;
};

export type TopEmployee = {
    name: string;
    nip: string;
    total: number;
    net_salary: number;
    instalment_payment: number;
};

export type DashboardCharts = {
    salary_trend: SalaryTrend[];
    daily_activity: DailyActivity[];
    salary_by_position: SalaryByPosition[];
};

export type DashboardProps = {
    title: string;
    summary: DashboardSummary;
    charts: DashboardCharts;
    top_employees: TopEmployee[];
};
