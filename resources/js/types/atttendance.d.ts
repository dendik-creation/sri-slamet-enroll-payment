import { Employee } from "@/types/employee";
import { SelectOption } from "./global";

export type Attendance = {
    id: number;
    employee_id: number;
    // Period-based fields
    period_start: string; // Y-m-d
    period_end: string; // Y-m-d
    work_days: number; // can be fractional (e.g., 5.5)
    overtime: number; // total overtime hours in the period
    is_used?: boolean;
    employee: Employee;
};

export type AttendanceIndexProps = {
    title: string;
    description?: string;
    attendances: PaginationData<Attendance>;
    employees: SelectOption[];
    filter: {
        period_start: string;
        period_end: string;
        employee_type: string | null;
        search: string | null;
    };
};
