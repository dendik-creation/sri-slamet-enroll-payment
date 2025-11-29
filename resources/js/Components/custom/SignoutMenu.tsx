import { LogOut } from "lucide-react";
import { router } from "@inertiajs/react";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";

const SignoutMenu = () => {
    const [open, setOpen] = useState(false);

    const handleSignOut = async () => {
        router.post("/auth/signout", {}, { preserveScroll: true });
        setOpen(false);
    };

    const handleClick = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        setOpen(true);
    };

    return (
        <>
            <DropdownMenuItem
                key={"sign-out"}
                className="flex text-red-600 w-full cursor-pointer items-center gap-2"
                onSelect={handleClick}
            >
                <LogOut />
                Logout
            </DropdownMenuItem>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Log Out</DialogTitle>
                        <DialogDescription>
                            Jika Anda keluar, Anda harus login kembali untuk
                            mengakses aplikasi ini.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Tidak
                        </Button>
                        <Button variant="red" onClick={handleSignOut}>
                            Ya
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default SignoutMenu;
