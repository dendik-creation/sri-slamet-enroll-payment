import AppLayout from "@/Partials/AppLayout";
import { PageTitle } from "@/Partials/PageTitle";
import { Employee, EmployeeIndexProps } from "@/types/employee";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { PencilIcon, Plus, SearchXIcon, TrashIcon } from "lucide-react";
import {
    floatToIdCurrency,
    inputDebounce,
    ymdToIdDate,
} from "@/Components/helper/helper";
import { Button } from "@/Components/ui/button";
import ConfirmDialog from "@/Components/custom/ConfirmDialog";
import { Link, router, useForm } from "@inertiajs/react";
import {
    PaginatorBuilder,
    SearchInput,
    SelectSearchInput,
} from "@/Components/custom/FormElement";
import { useState } from "react";

const EmployeeIndex = ({
    title,
    description,
    search,
    employees,
    setting,
    employee_type,
}: EmployeeIndexProps) => {
    const { delete: deleteEmployee, processing: isDeleting } = useForm();
    const [employeesData, setEmployeesData] = useState<Employee[]>(
        employees.data
    );
    const [searchValue, setSearchValue] = useState<string>(search || "");
    const [employeeTypeFilter, setEmployeeTypeFilter] = useState<
        "daily" | "monthly" | null
    >(employee_type);

    const getSalaryTypeLabel = (salary_type: string): string => {
        return salary_type === "daily" ? "Harian" : "Bulanan";
    };

    const debouncedSearch = inputDebounce(
        async (
            valueSearch: string,
            valueEmployeeType: "daily" | "monthly" | null
        ) => {
            router.get(
                "/employee",
                { search: valueSearch, employee_type: valueEmployeeType },
                {
                    preserveState: true,
                    replace: true,
                    onSuccess: (page) => {
                        setEmployeesData(page.props.employees as Employee[]);
                    },
                }
            );
        }
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        debouncedSearch(value, employeeTypeFilter);
    };

    const handleDelete = (id: number) => {
        if (isDeleting) return;
        deleteEmployee(`/employee/${id}`, {
            preserveScroll: true,
            replace: true,
            onSuccess: () => {
                setEmployeesData((prev) => prev.filter((emp) => emp.id !== id));
            },
        });
    };
    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            <div className="flex lg:flex-row flex-col lg:gap-0 gap-3 items-start lg:items-center justify-between mb-4">
                <div className="flex relative gap-3 items-center w-full">
                    <SearchInput
                        placeholder={`Cari berdasarkan NIP atau nama karyawan`}
                        className="lg:max-w-sm w-full"
                        onChange={handleSearch}
                        value={searchValue || ""}
                    />
                    <div className="">
                        <SelectSearchInput
                            value={employeeTypeFilter || ""}
                            onChange={(employee_type) => {
                                setEmployeeTypeFilter(
                                    employee_type as "daily" | "monthly"
                                );
                                debouncedSearch(
                                    searchValue,
                                    employee_type as "daily" | "monthly"
                                );
                            }}
                            placeholder="Pilih Tipe Gaji"
                            options={[
                                { value: "monthly", label: "Bulanan" },
                                { value: "daily", label: "Harian" },
                            ]}
                            removeValue={() => {
                                setEmployeeTypeFilter(null);
                                debouncedSearch(searchValue, null);
                            }}
                        />
                    </div>
                </div>
                <Link href="/employee/create">
                    <Button variant={"blue"} className="cursor-pointer">
                        <Plus />
                        <span>Tambah Karyawan</span>
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="bg-amber-200 font-semibold">
                                #
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                NIP
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Nama
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Jabatan
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Tanggal bergabung
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Tipe gaji
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Gaji Harian
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Gaji Bulanan
                            </TableHead>
                            <TableHead className="bg-amber-200 font-semibold">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.data.length ? (
                            employees.data.map((emp: Employee, idx: number) => (
                                <TableRow key={emp.id}>
                                    <TableCell>
                                        {idx +
                                            1 +
                                            employees.per_page *
                                                (employees.current_page - 1)}
                                    </TableCell>
                                    <TableCell>{emp.nip}</TableCell>
                                    <TableCell>{emp.name}</TableCell>
                                    <TableCell>{emp?.position?.name}</TableCell>
                                    <TableCell>
                                        {ymdToIdDate(
                                            emp?.join_date?.toString()
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {getSalaryTypeLabel(emp.salary_type)}
                                    </TableCell>
                                    <TableCell>
                                        {floatToIdCurrency(
                                            emp.salary_per_day,
                                            true,
                                            false
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {emp.salary_per_month
                                            ? floatToIdCurrency(
                                                  emp.salary_per_month,
                                                  true,
                                                  false
                                              )
                                            : "-"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/employee/${emp.id}/edit`}
                                            >
                                                <Button
                                                    variant="blue"
                                                    size="icon"
                                                >
                                                    <PencilIcon />
                                                </Button>
                                            </Link>
                                            <ConfirmDialog
                                                title="Hapus Karyawan"
                                                description="Apakah Anda yakin ingin menghapus karyawan ini?"
                                                type="danger"
                                                confirmAction={() =>
                                                    handleDelete(emp.id)
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
            {employees.total > employees.per_page && (
                <PaginatorBuilder
                    prevUrl={(() => {
                        if (!employees.prev_page_url) return "#";
                        const url = new URL(employees.prev_page_url);
                        const params = new URLSearchParams();
                        params.set("search", searchValue);
                        params.set("employee_type", employeeTypeFilter || "");
                        params.set("page", employees.current_page - 1 + "");
                        return url.pathname + "?" + params.toString();
                    })()}
                    nextUrl={(() => {
                        if (!employees.next_page_url) return "#";
                        const url = new URL(employees.next_page_url);
                        const params = new URLSearchParams();
                        params.set("search", searchValue);
                        params.set("employee_type", employeeTypeFilter || "");
                        params.set("page", employees.current_page + 1 + "");
                        return url.pathname + "?" + params.toString();
                    })()}
                    currentPage={employees.current_page}
                    totalPage={employees.last_page}
                />
            )}
        </AppLayout>
    );
};

export default EmployeeIndex;
