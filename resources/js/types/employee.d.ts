import { Position } from "@/types/position";
import { AppSetting } from "@/types/global";

export type Employee = {
    id: number;
    name: string;
    nip: string;
    join_date: Date;
    salary_per_day: number;
    salary_per_month?: number;
    salary_type: "daily" | "monthly";
    position_id: number;
    position: Position;
};

export type EmployeeFormData = {
    name: string | null;
    nip: string | null;
    join_date: Date | string | null;
    salary_per_day: number | null;
    salary_per_month: number | null;
    salary_type: "daily" | "monthly" | null;
    position_id: number | null;
};

// Pages
export type EmployeeIndexProps = {
    title: string;
    description?: string;
    employees: PaginationData<Employee>;
    employee_type: "daily" | "monthly" | null;
    setting: AppSetting;
    search?: string;
};

export type EmployeeCreateProps = {
    title: string;
    description?: string;
    positions: SelectOption[];
};

export type EmployeeEditProps = {
    title: string;
    description?: string;
    employee: Employee;
    positions: SelectOption[];
};
