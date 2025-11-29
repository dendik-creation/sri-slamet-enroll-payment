import { TriangleAlert, Search, CircleX, CalendarIcon } from "lucide-react";
import React, { ChangeEvent, useState } from "react";
import { Input } from "@/Components/ui/input";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/Components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/Components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/ui/pagination";
import { Calendar } from "@/Components/ui/calendar";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { ymdToIdDate } from "../helper/helper";
import { SelectOption } from "@/types/global";

registerPlugin(FilePondPluginFileValidateType);

type ErrorInputProps = {
    error: string | null;
};

export function ErrorInput({ error }: ErrorInputProps) {
    return (
        <p className="text-sm text-red-500 mt-1.5 flex items-center">
            <TriangleAlert size={16} className="me-2" />
            {error}
        </p>
    );
}
type SearchInputProps = {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
};

export function SearchInput({
    value,
    onChange,
    placeholder = "Cari...",
    className,
}: SearchInputProps) {
    return (
        <div className={`relative w-full ${className}`}>
            <Input
                type="text"
                className="p-3"
                placeholder={placeholder}
                onChange={onChange}
                value={value}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
            />
            <Search
                className="absolute top-2.5 right-2 text-gray-500"
                size={16}
            />
        </div>
    );
}

export function SelectSearchInput({
    value,
    options,
    onChange,
    placeholder,
    removeValue,
    className,
}: {
    value: string;
    options: SelectOption[];
    onChange: (value: string | number) => void;
    placeholder?: string;
    removeValue?: () => void;
    className?: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "min-w-full py-1.5 justify-between relative border border-gray-300 rounded-md px-4 flex items-center cursor-pointer",
                        className
                    )}
                >
                    {value ? (
                        <span className="font-normal">
                            {
                                options.find((option) => option.value == value)
                                    ?.label
                            }
                        </span>
                    ) : (
                        <span className="font-normal text-slate-500">
                            {placeholder}
                        </span>
                    )}
                    {value != "" && value != undefined && removeValue ? (
                        <span
                            className="ml-2 h-4 w-4 shrink-0 opacity-50 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent closing the popover
                                removeValue();
                            }}
                        >
                            <CircleX size={20} />
                        </span>
                    ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent className="min-w-[400px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Cari pilihan..." />
                    <CommandList>
                        <CommandEmpty>Pilihan tidak ada</CommandEmpty>
                        <CommandGroup>
                            {options &&
                                options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.value}
                                        onSelect={() => {
                                            onChange(option.value);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === option.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        <span className="w-full">
                                            {option.label}
                                        </span>
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export const MultiSelectSearchInput = ({
    values,
    options,
    onChange,
    placeholder,
}: {
    values: string[];
    options: { label: string; value: string }[];
    onChange: (values: string[]) => void;
    placeholder?: string;
}) => {
    const [open, setOpen] = React.useState(false);

    const toggleValue = (value: string) => {
        // Normalize comparison to string to avoid strict-equality mismatch (e.g., number vs string)
        const exists = values.includes(String(value));
        if (exists) {
            // Use non-strict inequality to remove all duplicates of the same normalized value
            onChange(values.filter((v) => v != String(value)));
        } else {
            onChange([...values, String(value)]);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    role="combobox"
                    aria-expanded={open}
                    className="min-w-full h-full py-3 justify-between relative border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md px-4 flex items-center cursor-pointer"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setOpen(!open);
                        }
                    }}
                >
                    {values.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {values.map((val) => {
                                // Ensure we match using normalized string values
                                const label = options.find(
                                    (option) =>
                                        String(option.value) === String(val)
                                )?.label;
                                return (
                                    <span
                                        key={val}
                                        className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1"
                                    >
                                        {label}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleValue(val);
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <CircleX size={16} />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    ) : (
                        <span className="font-normal text-slate-500 text-base">
                            {placeholder}
                        </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </div>
            </PopoverTrigger>
            <PopoverContent className="min-w-[400px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Cari pilihan..." />
                    <CommandList>
                        <CommandEmpty>Pilihan tidak ada</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const optVal = String(option.value);
                                const isSelected = values.includes(optVal);
                                return (
                                    <CommandItem
                                        key={optVal}
                                        value={optVal}
                                        onSelect={() => toggleValue(optVal)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                isSelected
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        <span className="w-full">
                                            {option.label}
                                        </span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export const DatePickerInput = ({
    value,
    onChange,
    placeholder = "Pilih tanggal",
    mode = "single",
    className,
    disabled = false,
}: {
    value: string | undefined | { from: Date; to: Date } | string[];
    onChange: (date: string | undefined) => void;
    placeholder?: string;
    mode: "single" | "multiple" | "range";
    className?: string;
    disabled?: boolean;
}) => {
    const formatDate = (date: string | Date | undefined) => {
        if (!date) return placeholder;

        try {
            // Handle Date object
            if (date instanceof Date) {
                if (isNaN(date.getTime())) return placeholder;
                const formattedDate = date
                    .toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                    })
                    .split("/")
                    .reverse()
                    .join("-");
                return ymdToIdDate(formattedDate);
            }

            // Handle string
            if (typeof date === "string" && date.trim() === "")
                return placeholder;

            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) return placeholder;

            const formattedDate = parsedDate
                .toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                })
                .split("/")
                .reverse()
                .join("-");

            return ymdToIdDate(formattedDate);
        } catch (error) {
            console.warn("Error formatting date:", error);
            return placeholder;
        }
    };

    const handleSelect = (
        date: Date | Date[] | { from: Date; to: Date } | undefined
    ) => {
        if (!date) {
            onChange(undefined);
            return;
        }

        try {
            const formatSingleDate = (d: Date) => {
                if (!d || isNaN(d.getTime())) return "";
                return d
                    .toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                    })
                    .split("/")
                    .reverse()
                    .join("-");
            };

            if (mode === "single") {
                const formattedDate = formatSingleDate(date as Date);
                onChange(formattedDate || undefined);
            } else if (mode === "multiple" && Array.isArray(date)) {
                const formattedDates = date
                    .map(formatSingleDate)
                    .filter(Boolean);
                onChange(
                    formattedDates.length > 0
                        ? formattedDates.join(",")
                        : undefined
                );
            } else if (mode === "range") {
                const range = date as { from: Date; to: Date };
                if (
                    range.from &&
                    range.to &&
                    !isNaN(range.from.getTime()) &&
                    !isNaN(range.to.getTime())
                ) {
                    onChange(
                        `${formatSingleDate(range.from)} - ${formatSingleDate(
                            range.to
                        )}`
                    );
                } else {
                    onChange(undefined);
                }
            }
        } catch (error) {
            console.warn("Error handling date selection:", error);
            onChange(undefined);
        }
    };

    // Handle selected value for Calendar component
    const getSelectedValue = () => {
        if (!value) return undefined;

        try {
            if (
                mode === "range" &&
                typeof value === "object" &&
                "from" in value
            ) {
                // Validate dates
                if (
                    value.from &&
                    value.to &&
                    !isNaN(value.from.getTime()) &&
                    !isNaN(value.to.getTime())
                ) {
                    return value;
                }
                return undefined;
            } else if (mode === "range" && typeof value === "string") {
                // Parse string format "YYYY-MM-DD - YYYY-MM-DD"
                const [startStr, endStr] = value.split(" - ");
                if (startStr && endStr) {
                    const fromDate = new Date(startStr.trim());
                    const toDate = new Date(endStr.trim());
                    if (
                        !isNaN(fromDate.getTime()) &&
                        !isNaN(toDate.getTime())
                    ) {
                        return {
                            from: fromDate,
                            to: toDate,
                        };
                    }
                }
            } else if (mode === "single" && typeof value === "string") {
                if (value.trim() === "") return undefined;
                const parsedDate = new Date(value);
                if (!isNaN(parsedDate.getTime())) {
                    return parsedDate;
                }
            }
        } catch (error) {
            console.warn("Error parsing selected value:", error);
        }

        return undefined;
    };

    // Compute a sensible default month for the calendar (so users can jump directly)
    const getDefaultMonth = () => {
        const selectedVal = getSelectedValue();
        try {
            if (
                mode === "range" &&
                selectedVal &&
                typeof selectedVal === "object" &&
                "from" in (selectedVal as any)
            ) {
                const from = (selectedVal as { from?: Date; to?: Date }).from;
                if (from instanceof Date && !isNaN(from.getTime())) return from;
            } else if (mode === "single" && selectedVal instanceof Date) {
                if (!isNaN(selectedVal.getTime())) return selectedVal;
            }
        } catch (e) {
            // noop: fallback to today
        }
        return new Date();
    };

    return (
        <Popover>
            <PopoverTrigger disabled={disabled} asChild>
                <button
                    className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full pl-3 h-10 text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    {mode === "range" &&
                    typeof value === "object" &&
                    "from" in value ? (
                        <span>
                            {formatDate(value.from)} - {formatDate(value.to)}
                        </span>
                    ) : mode === "range" && typeof value === "string" ? (
                        <span>
                            {value && value.includes(" - ")
                                ? value
                                      .split(" - ")
                                      .map(
                                          (date) =>
                                              ymdToIdDate(date.trim()) ||
                                              date.trim()
                                      )
                                      .join(" - ")
                                : placeholder}
                        </span>
                    ) : (
                        <span>{formatDate(value as string)}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Calendar
                    mode={mode as any}
                    selected={getSelectedValue() as any}
                    onSelect={handleSelect as any}
                    /* Enable fast navigation to old years without month-by-month clicks */
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear() + 10}
                    defaultMonth={getDefaultMonth()}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
};

export const PaginatorBuilder = ({
    prevUrl,
    nextUrl,
    currentPage,
    totalPage,
}: {
    prevUrl: string;
    nextUrl: string;
    currentPage: number;
    totalPage: number;
}) => {
    const generatePageNumbers = () => {
        const pages = [];

        if (totalPage <= 4) {
            for (let i = 1; i <= totalPage; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            if (currentPage <= 2) {
                pages.push(2, 3);
                pages.push("ellipsis");
                pages.push(totalPage);
            } else if (currentPage >= totalPage - 1) {
                pages.push("ellipsis");
                pages.push(totalPage - 2, totalPage - 1, totalPage);
            } else {
                pages.push("ellipsis");
                pages.push(currentPage);
                pages.push("ellipsis");
                pages.push(totalPage);
            }
        }

        return pages;
    };

    const pageNumbers = generatePageNumbers();
    const isPrevDisabled = currentPage === 1;
    const isNextDisabled = currentPage === totalPage;

    return (
        <Pagination className="flex justify-end mt-4">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href={isPrevDisabled ? "#" : prevUrl}
                        className={cn(
                            isPrevDisabled && "pointer-events-none opacity-50"
                        )}
                    />
                </PaginationItem>

                {pageNumbers.map((page, index) => {
                    if (page === "ellipsis") {
                        return (
                            <PaginationItem key={`ellipsis-${index}`}>
                                <span className="flex h-9 w-9 items-center justify-center">
                                    ...
                                </span>
                            </PaginationItem>
                        );
                    }

                    const pageNum = page as number;
                    const isActive = pageNum === currentPage;

                    return (
                        <PaginationItem key={pageNum}>
                            <a
                                href={`?page=${pageNum}`}
                                className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                                    isActive &&
                                        "bg-primary text-primary-foreground hover:bg-primary/90"
                                )}
                            >
                                {pageNum}
                            </a>
                        </PaginationItem>
                    );
                })}

                <PaginationItem>
                    <PaginationNext
                        href={isNextDisabled ? "#" : nextUrl}
                        className={cn(
                            isNextDisabled && "pointer-events-none opacity-50"
                        )}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};
