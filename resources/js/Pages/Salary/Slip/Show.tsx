import AppLayout from "@/Partials/AppLayout";
import { PageTitle } from "@/Partials/PageTitle";
import { SalarySlipShowProps } from "@/types/salaries";
import React from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { HandCoins, IdCardLanyard, Edit } from "lucide-react";
import { floatToIdCurrency, ymdToIdDate } from "@/Components/helper/helper";
import { router } from "@inertiajs/react";
const SalarySlipShow = ({
    title,
    description,
    salary,
    deductions,
    bonuses,
}: SalarySlipShowProps) => {
    const handleEdit = () => {
        router.get(`/salary-slip/edit/${salary.id}`);
    };

    return (
        <AppLayout>
            <PageTitle title={title} description={description} />

            <div className="mb-4">
                <Button
                    variant={"purple"}
                    onClick={handleEdit}
                    className="flex items-center gap-2"
                >
                    <Edit className="w-4 h-4" />
                    Edit Slip Gaji
                </Button>
            </div>

            <div className="mt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="py-3">
                        <CardContent className="px-3">
                            <div className="flex items-center gap-3 mb-2">
                                <HandCoins className="text-slate-400" />
                                <h3 className="font-semibold">
                                    Gaji yang Diterima
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="text-sm flex flex-col gap-1">
                                    <div className="flex flex-col items-start">
                                        <span className="font-semibold text-slate-600">
                                            Total Hari Kerja & Jam Lembur
                                        </span>
                                        <span>
                                            {salary.total_work_days} /{" "}
                                            {salary.total_overtime_hours}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="font-semibold text-slate-600">
                                            Gaji Pokok
                                        </span>
                                        <span>
                                            {floatToIdCurrency(
                                                salary.basic_salary
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="font-semibold text-slate-600">
                                            Gaji Lembur
                                        </span>
                                        <span>
                                            {salary.overtime_salary > 0
                                                ? floatToIdCurrency(
                                                      salary.overtime_salary
                                                  )
                                                : "-"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="font-semibold text-slate-600">
                                            Bonus
                                        </span>
                                        <ul className="">
                                            {bonuses.length > 0
                                                ? bonuses.map((bonus, idx) => (
                                                      <li key={idx}>
                                                          {bonus.name} (
                                                          {floatToIdCurrency(
                                                              bonus.amount
                                                          )}
                                                          )
                                                      </li>
                                                  ))
                                                : "-"}
                                        </ul>
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="font-semibold text-slate-600">
                                            Potongan
                                        </span>
                                        <ul className="text-red-600">
                                            {deductions.length > 0
                                                ? deductions.map(
                                                      (deduction, idx) => (
                                                          <li key={idx}>
                                                              {deduction.name} (
                                                              {floatToIdCurrency(
                                                                  deduction.amount
                                                              )}
                                                              )
                                                          </li>
                                                      )
                                                  )
                                                : "-"}
                                        </ul>
                                    </div>
                                </div>
                                <div className="text-sm flex flex-col gap-1 me-3">
                                    <ul className="flex flex-col items-end">
                                        <li>
                                            {floatToIdCurrency(
                                                salary.basic_salary
                                            )}
                                        </li>
                                        <li>
                                            {floatToIdCurrency(
                                                salary.overtime_salary
                                            )}
                                        </li>
                                        <li>
                                            {bonuses.length > 0
                                                ? floatToIdCurrency(
                                                      bonuses.reduce(
                                                          (total, bonus) =>
                                                              total +
                                                              bonus.amount,
                                                          0
                                                      )
                                                  )
                                                : floatToIdCurrency(0)}
                                        </li>
                                        <li>___________ +</li>
                                        <li>
                                            {floatToIdCurrency(
                                                salary.basic_salary +
                                                    salary.overtime_salary +
                                                    Number(
                                                        bonuses.length > 0
                                                            ? bonuses.reduce(
                                                                  (
                                                                      total,
                                                                      bonus
                                                                  ) =>
                                                                      total +
                                                                      bonus.amount,
                                                                  0
                                                              )
                                                            : 0
                                                    )
                                            )}
                                        </li>
                                        <li className="text-red-600">
                                            {deductions.length > 0
                                                ? floatToIdCurrency(
                                                      deductions.reduce(
                                                          (total, deduction) =>
                                                              Number(total) +
                                                              Number(
                                                                  deduction.amount
                                                              ),
                                                          0
                                                      )
                                                  )
                                                : floatToIdCurrency(0)}
                                        </li>
                                        <li>___________ -</li>
                                        <li className="font-semibold text-xl text-green-600">
                                            {floatToIdCurrency(
                                                salary.net_salary
                                            )}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="py-3">
                        <CardContent className="px-3">
                            <div className="flex items-center gap-3 mb-2">
                                <IdCardLanyard className="text-slate-400" />
                                <h3 className="font-semibold">
                                    Informasi Karyawan
                                </h3>
                            </div>
                            <div className="text-sm flex flex-col gap-2">
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        NIP
                                    </span>
                                    <span>{salary.employee.nip}</span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        Nama
                                    </span>
                                    <span>{salary.employee.name}</span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        Jabatan
                                    </span>
                                    <span>{salary.employee.position.name}</span>
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-600">
                                        Tanggal Bergabung
                                    </span>
                                    <span>
                                        {ymdToIdDate(
                                            salary.employee.join_date.toString()
                                        )}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default SalarySlipShow;
