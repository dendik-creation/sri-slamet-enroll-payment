import React, { FormEvent } from "react";
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
import { Loader } from "lucide-react";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";

type ModalImportDatabaseProps = {
    title: string;
    description: string;
    triggerNode: React.ReactNode;
    onSubmit: (e: FormEvent) => void;
    file?: File | null;
    onFileChange: (file: File | null) => void;
    isImporting: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

const ModalImportDatabase = ({
    title,
    description,
    triggerNode,
    onSubmit,
    file,
    onFileChange = () => {},
    isImporting,
    open = false,
    onOpenChange = () => {},
}: ModalImportDatabaseProps) => {
    return (
        <Dialog open={open || isImporting} onOpenChange={onOpenChange}>
            <DialogTrigger>
                <span>{triggerNode}</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription className="mb-3">
                        {description}
                    </DialogDescription>
                    <div className="flex flex-col gap-3">
                        <div className="bg-yellow-100 text-sm border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                            <strong>Peringatan:</strong> Import database akan
                            menimpa semua data yang ada saat ini. Pastikan Anda
                            telah membuat backup terlebih dahulu. Setelah
                            import, Anda mungkin perlu login ulang.
                        </div>
                        <FilePond
                            allowProcess={true}
                            files={file ? [file] : []}
                            onupdatefiles={(fileItems) => {
                                const selectedFile =
                                    fileItems.length > 0
                                        ? fileItems[0].file
                                        : null;
                                onFileChange(selectedFile as File | null);
                            }}
                            allowMultiple={false}
                            labelIdle='<span class="filepond--label-action">Cari File Database SQLite</span>'
                        />
                    </div>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild disabled={isImporting}>
                        <Button
                            type="button"
                            disabled={isImporting}
                            variant="outline"
                        >
                            Batalkan
                        </Button>
                    </DialogClose>
                    <Button
                        type="submit"
                        onClick={onSubmit}
                        disabled={isImporting || !file}
                        variant={"yellow"}
                    >
                        {isImporting ? (
                            <Loader className="animate-spin" />
                        ) : (
                            <span>Import Database</span>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ModalImportDatabase;
