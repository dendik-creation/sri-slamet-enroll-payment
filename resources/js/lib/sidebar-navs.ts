import {
    BanknoteArrowDown,
    DatabaseBackup,
    DiamondPercent,
    Fingerprint,
    Grid2X2,
    HandCoins,
    IdCardLanyard,
    Layers2,
    LucideProps,
    Mails,
    ReceiptText,
    SlidersVertical,
    TicketPercent,
} from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export type NavItems = {
    type: "item" | "splitter";
    title: string;
    url: string;
    icon?: ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
}[];

const sidebarNavs = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Grid2X2,
        type: "item",
    },
    {
        title: "Master Karyawan",
        type: "splitter",
        url: "#",
    },
    {
        title: "Jabatan",
        url: "/position",
        icon: Layers2,
        type: "item",
    },
    {
        title: "Karyawan",
        url: "/employee",
        icon: IdCardLanyard,
        type: "item",
    },
    {
        title: "Master Kehadiran",
        type: "splitter",
        url: "#",
    },
    {
        title: "Kehadiran",
        url: "/attendance",
        icon: Fingerprint,
        type: "item",
    },
    {
        title: "Keuangan",
        type: "splitter",
        url: "#",
    },
    {
        title: "Potongan Gaji",
        url: "/salary-deduction",
        icon: TicketPercent,
        type: "item",
    },
    {
        title: "Angsuran",
        url: "/instalment",
        icon: HandCoins,
        type: "item",
    },
    {
        title: "Pengeluaran",
        type: "splitter",
        url: "#",
    },
    {
        title: "Gaji Harian",
        url: "/salary-daily",
        icon: HandCoins,
        type: "item",
    },
    {
        title: "Gaji Bulanan",
        url: "/salary-monthly",
        icon: HandCoins,
        type: "item",
    },
    {
        title: "THR",
        url: "/thr",
        icon: DiamondPercent,
        type: "item",
    },
    {
        title: "Amplop Slip Gaji",
        url: "/slip-envelope",
        icon: Mails,
        type: "item",
    },
    {
        title: "Slip Gaji",
        url: "/salary-slip",
        icon: ReceiptText,
        type: "item",
    },
    {
        title: "Total Pengeluaran",
        url: "/expense",
        icon: BanknoteArrowDown,
        type: "item",
    },
    {
        title: "Pengaturan",
        type: "splitter",
        url: "#",
    },
    {
        title: "Pengaturan Aplikasi",
        url: "/setting",
        icon: SlidersVertical,
        type: "item",
    },
    {
        title: "Backup Database",
        url: "/backup",
        icon: DatabaseBackup,
        type: "item",
    },
];

export default sidebarNavs as NavItems;
