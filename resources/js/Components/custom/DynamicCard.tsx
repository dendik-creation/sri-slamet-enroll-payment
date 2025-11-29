import React from "react";
import { Card, CardContent } from "../ui/card";

type DynamicCardProps = {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: "blue" | "green" | "red" | "yellow" | "purple";
    subfooter?: React.ReactNode;
};

const DynamicCard = ({
    title,
    value,
    icon,
    color,
    subfooter,
}: DynamicCardProps) => {
    return (
        <Card className="relative overflow-hidden">
            <CardContent>
                <div className={`flex items-center space-x-4`}>
                    <div className={`absolute -bottom-8 -right-10`}>{icon}</div>
                    <div>
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <p className={`text-xl font-bold text-${color}-500`}>
                            {value}
                        </p>
                    </div>
                </div>
                {subfooter && (
                    <div className="mt-2 text-sm text-gray-500">
                        {subfooter}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DynamicCard;
