import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/Components/ui/sidebar";
import sidebarNavs from "@/lib/sidebar-navs";
import { Link } from "@inertiajs/react";
import { ArrowBigRightDash } from "lucide-react";

export default function AppSidebar() {
    const items = sidebarNavs;
    const pathname = window.location.pathname;
    return (
        <Sidebar>
            <SidebarContent className="bg-gray-800 min-h-full relative h-full flex flex-col">
                <SidebarHeader className="mt-3 ms-3 gap-0">
                    <span className="text-white/80 font-bold">
                        Penggajian Karyawan
                    </span>
                    <span className="text-white/60 text-sm font-normal">
                        CV Sri Slamet
                    </span>
                </SidebarHeader>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item, index: number) => {
                                if (item.type === "splitter") {
                                    return (
                                        <SidebarMenuItem
                                            className="border-b border-slate-700 mt-2"
                                            key={item.title}
                                        >
                                            <SidebarMenuButton
                                                disabled
                                                className="text-white uppercase text-xs"
                                            >
                                                <ArrowBigRightDash />
                                                {item.title}
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                } else {
                                    const Icon = item.icon;
                                    return (
                                        <SidebarMenuItem
                                            className={`text-white/80 transition-all`}
                                            key={item.title}
                                        >
                                            <SidebarMenuButton
                                                isActive={
                                                    pathname == item.url ||
                                                    pathname.includes(item.url)
                                                }
                                                className="transition-all"
                                                asChild
                                            >
                                                <Link
                                                    href={
                                                        item.url == pathname
                                                            ? "#"
                                                            : item.url
                                                    }
                                                    className="flex items-center gap-2"
                                                >
                                                    {Icon && <Icon />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                }
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
