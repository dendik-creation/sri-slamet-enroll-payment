import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/Components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { ChevronDown, Key } from "lucide-react";
import SignoutMenu from "@/Components/custom/SignoutMenu";
import ChangePasswordModal from "@/Components/custom/ChangePasswordModal";
interface AppHeaderProps {
    classNames?: string;
    username?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ classNames, username }) => {
    return (
        <header
            className={cn(
                "w-full h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shadow-sm",
                classNames
            )}
        >
            <div className="flex items-center gap-4">
                <SidebarTrigger />
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-3 cursor-pointer select-none">
                        <div className="flex text-sm flex-col justify-center items-end">
                            <span className="text-xs">
                                Hai, {username ?? ""}
                            </span>
                        </div>
                        <Avatar className="border-2 border-solid transition-all border-gray-800">
                            <AvatarImage src="/assets/img/user_icon.png" />
                            <AvatarFallback>ME</AvatarFallback>
                        </Avatar>
                        <ChevronDown size={16} />
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuGroup>
                        <ChangePasswordModal />
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <SignoutMenu />
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
};

export default AppHeader;
