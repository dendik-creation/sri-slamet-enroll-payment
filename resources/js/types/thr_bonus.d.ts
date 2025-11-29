import { PageTitleProps } from "@/Partials/PageTitle";
import { Employee } from "./employee";
import { PaginationData } from "./global";

export type ThrBonus = {
    id: number;
    year: string;
    paid_at: string;
    total_amount: number;
    employee_thrs: EmployeeThrBonus[];
};

export type EmployeeThrBonus = {
    id: number;
    thr_bonus_id: number;
    employee_id: number;
    amount: number;
    employee?: Employee;
};

export type ThrBonusIndexProps = PageTitleProps & {
    thr_bonuses: PaginationData<ThrBonus>;
    is_thr_given: boolean;
};

export type ThrBonusShowProps = PageTitleProps & {
    thr_bonus: ThrBonus;
};

export type ThrBonusPrintAllProps = PageTitleProps & {
    thr_bonus: ThrBonus;
    company_name: string;
    back_url: string;
};

export type ThrBonusPrintSpecificProps = PageTitleProps & {
    employee_thr: EmployeeThrBonus;
    company_name: string;
    back_url: string;
};
