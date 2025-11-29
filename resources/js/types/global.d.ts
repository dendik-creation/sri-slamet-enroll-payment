import { PageTitleProps } from "@/Partials/PageTitle";

interface PaginationLink {
    url: string;
    label: string;
    active: boolean;
}
type AppSetting = {
    id?: number;
    normal_work_hours?: number;
    attendance_start?: string;
    attendance_end?: string;
};

interface PaginationData<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

interface SelectOption {
    value: string;
    label: string;
    other_info?: {
        [key: string]: any;
    };
}

type DBBackup = {
    file_name: string;
    file_path: string;
    backup_at: string;
};

type BackupIndexProps = PageTitleProps & {
    backups: DBBackup[];
};

type SettingIndexPropos = PageTitleProps & {
    setting: AppSetting;
};
