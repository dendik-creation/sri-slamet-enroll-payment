import { format } from "date-fns";
import { id } from "date-fns/locale";

export const ymdToIdDate = (
    dateString: string | null | undefined,
    withTime: boolean = false,
    timeOnly: boolean = false,
    withDay: boolean = false
) => {
    if (!dateString) return null;
    const parsedDate = new Date(dateString as string);

    if (timeOnly) {
        return format(parsedDate, "HH:mm", { locale: id });
    }

    const formatString = withDay
        ? withTime
            ? "EEEE, d MMMM yyyy - HH:mm"
            : "EEEE, d MMMM yyyy"
        : withTime
        ? "d MMMM yyyy - HH:mm"
        : "d MMMM yyyy";

    return format(parsedDate, formatString, { locale: id });
};

export const floatToIdCurrency = (
    value: number | string,
    withSymbol: boolean = true,
    withDecimal: boolean = false
) => {
    const numberValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numberValue)) return "0";

    const formattedValue = numberValue.toLocaleString("id-ID", {
        style: "decimal",
        minimumFractionDigits: withDecimal ? 2 : 0,
        maximumFractionDigits: withDecimal ? 2 : 0,
    });

    return withSymbol ? `Rp${formattedValue}` : formattedValue;
};

export const inputDebounce = (
    callback: (...args: any[]) => void,
    delay: number = 1000
) => {
    let timer: ReturnType<typeof setTimeout>;

    return (...args: any[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback(...args);
        }, delay);
    };
};
