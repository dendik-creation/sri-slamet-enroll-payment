import AppLayout from "@/Partials/AppLayout";
import { PageTitle, PageTitleProps } from "@/Partials/PageTitle";
import { Position } from "@/types/position";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    PencilIcon,
    Plus,
    Save,
    SearchXIcon,
    TrashIcon,
    XIcon,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import BlastToaster from "@/Components/custom/BlastToaster";
import ConfirmDialog from "@/Components/custom/ConfirmDialog";

type PositionIndexProps = {
    positions: Position[];
} & PageTitleProps;

const initialPosition = { id: 0, name: "" };

const PositionIndex = ({
    positions,
    title,
    description,
}: PositionIndexProps) => {
    const [editId, setEditId] = useState<number | null>(null);
    const [createMode, setCreateMode] = useState(false);

    const createForm = useForm({ name: "" });
    const editForm = useForm<Position>(initialPosition);
    const { delete: deletePosition, processing: isDeleting } = useForm();

    const resetCreate = () => {
        setCreateMode(false);
        createForm.setData({ name: "" });
    };

    const startEdit = (position: Position) => {
        setEditId(position.id);
        editForm.setData(position);
    };

    const cancelEdit = () => {
        setEditId(null);
        editForm.setData(initialPosition);
    };

    const handleCreate = (e: FormEvent) => {
        e.preventDefault();
        if (!createForm.data.name.trim()) return;
        createForm.post("position", {
            preserveScroll: true,
            replace: true,
            onSuccess: resetCreate,
            onError: (errors) => console.error(errors),
        });
    };

    const handleUpdate = (e: FormEvent) => {
        e.preventDefault();
        if (!editForm.data.name.trim() || !editId) return;
        editForm.put(`position/${editId}`, {
            preserveScroll: true,
            replace: true,
            onSuccess: cancelEdit,
            onError: (errors) => console.error(errors),
        });
    };

    const handleDelete = (id: number) => {
        if (isDeleting) return;
        deletePosition(`position/${id}`, {
            preserveScroll: true,
            replace: true,
            onError: (errors) => console.error(errors),
        });
    };

    return (
        <AppLayout>
            <div className="flex justify-between items-center">
                <PageTitle title={title} description={description} />
                <Button
                    variant={createMode ? "red" : "blue"}
                    className="cursor-pointer"
                    onClick={
                        createMode ? resetCreate : () => setCreateMode(true)
                    }
                >
                    {createMode ? <XIcon /> : <Plus />}
                    <span>{createMode ? "Batalkan" : "Tambah Jabatan"}</span>
                </Button>
            </div>

            {createMode && (
                <form
                    onSubmit={handleCreate}
                    className="flex items-center gap-4 mb-4"
                >
                    <Input
                        type="text"
                        required
                        value={createForm.data.name}
                        onChange={(e) =>
                            createForm.setData({ name: e.target.value })
                        }
                        placeholder="Nama Jabatan"
                    />
                    <Button
                        type="submit"
                        variant="green"
                        disabled={createForm.processing}
                    >
                        <Save />
                        <span>Simpan</span>
                    </Button>
                </form>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="bg-amber-200 font-semibold">
                                #
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Nama Jabatan
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {positions.length ? (
                            positions.map((pos, idx) => (
                                <TableRow key={pos.id}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell width="40%">
                                        <Input
                                            type="text"
                                            disabled={editId !== pos.id}
                                            value={
                                                editId === pos.id
                                                    ? editForm.data.name
                                                    : pos.name
                                            }
                                            onChange={(e) =>
                                                editForm.setData({
                                                    ...editForm.data,
                                                    name: e.target.value,
                                                })
                                            }
                                            className={`rounded-md disabled:opacity-100 p-1 w-full ${
                                                editId === pos.id
                                                    ? "border border-slate-400"
                                                    : "border-none shadow-none"
                                            }`}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {editId === pos.id ? (
                                                <>
                                                    <Button
                                                        variant="red"
                                                        size="icon"
                                                        onClick={cancelEdit}
                                                    >
                                                        <XIcon />
                                                    </Button>
                                                    <form
                                                        onSubmit={handleUpdate}
                                                    >
                                                        <Button
                                                            type="submit"
                                                            variant="green"
                                                            disabled={
                                                                editForm.processing
                                                            }
                                                            size="icon"
                                                        >
                                                            <Save />
                                                        </Button>
                                                    </form>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="blue"
                                                        onClick={() =>
                                                            startEdit(pos)
                                                        }
                                                        size="icon"
                                                        disabled={!!editId}
                                                    >
                                                        <PencilIcon />
                                                    </Button>
                                                    <ConfirmDialog
                                                        title="Hapus Jabatan"
                                                        description="Apakah Anda yakin ingin menghapus jabatan ini?"
                                                        type="danger"
                                                        confirmAction={() =>
                                                            handleDelete(pos.id)
                                                        }
                                                        triggerNode={
                                                            <Button
                                                                variant="red"
                                                                size="icon"
                                                                disabled={
                                                                    !!editId ||
                                                                    isDeleting
                                                                }
                                                            >
                                                                <TrashIcon />
                                                            </Button>
                                                        }
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
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

export default PositionIndex;
