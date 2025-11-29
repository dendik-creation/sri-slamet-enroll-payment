import AppLayout from "@/Partials/AppLayout";
import { PageTitle } from "@/Partials/PageTitle";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    DatabaseBackup,
    Download,
    Loader,
    Plus,
    SearchXIcon,
    TrashIcon,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { useForm } from "@inertiajs/react";
import { BackupIndexProps } from "@/types/global";
import { ymdToIdDate } from "@/Components/helper/helper";
import ConfirmDialog from "@/Components/custom/ConfirmDialog";
import ModalImportDatabase from "@/Components/custom/ModalImportDatabase";
import BlastToaster from "@/Components/custom/BlastToaster";
import { FormEvent } from "react";

const BackupIndex = ({ title, description, backups }: BackupIndexProps) => {
    const { post: createBackup, processing: isCreatingBackup } = useForm();
    const { delete: deleteBackup, processing: isDeleting } = useForm();
    const { put: restoreBackup, processing: isRestoring } = useForm();

    const {
        data: importData,
        setData: setImportData,
        processing: isImporting,
        post: postImport,
    } = useForm({
        sqlite_file: null as File | null,
        openDialog: false as boolean,
    });

    const handleImport = (e: FormEvent) => {
        e.preventDefault();
        if (!importData.sqlite_file) return;
        postImport(`/backup/import-from-zero`, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            preserveScroll: true,
            replace: true,
            onError: (error: any) => {
                BlastToaster(
                    "error",
                    error.message || "Gagal mengimport database"
                );
            },
            onFinish: () => {
                setImportData("sqlite_file", null);
                setImportData("openDialog", false);
            },
        });
    };
    const handleCreateBackup = () => {
        createBackup("backup/create", {
            replace: true,
            preserveState: true,
        });
    };
    const handleDelete = (file_name: string) => {
        if (isDeleting) return;
        deleteBackup(`backup/delete/${file_name}`, {
            preserveScroll: true,
            replace: true,
            onError: (errors) => console.error(errors),
        });
    };

    const handleRestore = (file_name: string) => {
        if (isRestoring) return;
        restoreBackup(`backup/restore/${file_name}`, {
            preserveScroll: true,
            replace: true,
            onError: (errors) => console.error(errors),
        });
    };
    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            <div className="flex lg:flex-row flex-col lg:gap-0 gap-3 items-start lg:items-center justify-between mb-4">
                <Button
                    variant={"green"}
                    className="cursor-pointer"
                    onClick={handleCreateBackup}
                    disabled={isCreatingBackup}
                >
                    {isCreatingBackup ? (
                        <span className="animate-spin">
                            <Loader />
                        </span>
                    ) : (
                        <Plus />
                    )}
                    <span>Tambah Backup Database</span>
                </Button>
                <ModalImportDatabase
                    description="Silakan pilih file database untuk mengimport data"
                    isImporting={isImporting}
                    file={importData.sqlite_file}
                    onFileChange={(file: File | null) =>
                        setImportData("sqlite_file", file)
                    }
                    onSubmit={handleImport}
                    title="Import Database"
                    triggerNode={
                        <Button variant={"yellow"} className="cursor-pointer">
                            <DatabaseBackup />
                            <span>Import Database</span>
                        </Button>
                    }
                    open={importData.openDialog}
                    onOpenChange={(open: boolean) =>
                        setImportData("openDialog", open)
                    }
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="bg-amber-200 font-semibold">
                                #
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Waktu Backup
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Nama File
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {backups.length ? (
                            backups.map((backup, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>
                                        {ymdToIdDate(backup.backup_at, true)}
                                    </TableCell>
                                    <TableCell>{backup.file_name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <a
                                                href={`/backup/download/${backup.file_name}`}
                                            >
                                                <Button
                                                    size={"icon"}
                                                    variant={"blue"}
                                                >
                                                    <Download />
                                                </Button>
                                            </a>
                                            <ConfirmDialog
                                                title="Pulihkan Database"
                                                description="Apakah Anda yakin ingin memulihkan database dari backup ini? Hal ini akan menggantikan semua data yang sudah ada saat ini."
                                                type="warning"
                                                confirmAction={() =>
                                                    handleRestore(
                                                        backup.file_name
                                                    )
                                                }
                                                triggerNode={
                                                    <Button
                                                        variant="yellow"
                                                        size="icon"
                                                        disabled={isRestoring}
                                                    >
                                                        <DatabaseBackup />
                                                    </Button>
                                                }
                                            />
                                            <ConfirmDialog
                                                title="Hapus Backup Database"
                                                description="Apakah Anda yakin ingin menghapus backup database ini?"
                                                type="danger"
                                                confirmAction={() =>
                                                    handleDelete(
                                                        backup.file_name
                                                    )
                                                }
                                                triggerNode={
                                                    <Button
                                                        variant="red"
                                                        size="icon"
                                                        disabled={isDeleting}
                                                    >
                                                        <TrashIcon />
                                                    </Button>
                                                }
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="h-24 text-center"
                                >
                                    <div className="w-full flex flex-col items-center justify-center h-full gap-2">
                                        <SearchXIcon
                                            width={64}
                                            className="text-red-400"
                                        />
                                        <span>Data tidak ada</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
};

export default BackupIndex;
