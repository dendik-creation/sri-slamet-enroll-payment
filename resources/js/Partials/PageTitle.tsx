import { Button } from "@/Components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import { useEffect } from "react";

export type PageTitleProps = {
    title?: string;
    description?: string;
};

export const PageTitle = ({ title, description }: PageTitleProps) => {
    const pathname = window.location.pathname;
    useEffect(() => {
        document.title = title || "CV Sri Slamet";
    }, [title]);
    return (
        <>
            <div className="flex justify-start items-center gap-5 mb-5">
                {!pathname.includes("dashboard") &&
                    pathname.split("/").length > 1 && (
                        <Button
                            onClick={() => window.history.back()}
                            className="h-full py-5"
                            size={"icon"}
                            variant={"outline"}
                        >
                            <ChevronLeftIcon className="text-gray-800" />
                        </Button>
                    )}
                <div className="flex flex-col gap-1">
                    <h2 className="font-semibold text-2xl">{title}</h2>
                    <span className="text-slate-700">{description}</span>
                </div>
            </div>
        </>
    );
};
