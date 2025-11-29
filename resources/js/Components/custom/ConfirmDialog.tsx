import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";

type ConfirmDialogProps = {
    title: string;
    description: string;
    type: "danger" | "warning" | "info" | "success";
    triggerNode: React.ReactNode;
    confirmAction?: () => void;
    disabled?: boolean;
};

const ConfirmDialog = ({
    title,
    description,
    type,
    triggerNode,
    confirmAction,
    disabled = false,
}: ConfirmDialogProps) => {
    return (
        <Dialog>
            <DialogTrigger disabled={disabled}>{triggerNode}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Tidak</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button
                            type="submit"
                            onClick={confirmAction}
                            variant={
                                type == "danger"
                                    ? "red"
                                    : type == "warning"
                                    ? "yellow"
                                    : "blue"
                            }
                        >
                            Ya
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmDialog;
