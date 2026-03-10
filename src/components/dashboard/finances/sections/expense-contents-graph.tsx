import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import ExpenseBarChart from "../../charts/expense-bar-chart";
import { DateRange, DayPicker } from "react-day-picker";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useDashboardContextHooks } from "@/hooks";

const ExpenseContentsGraph = () => {
    const [periodSelected, setPeriodSelected] = useState<string>("");
    const [showDatePickerModal, setShowDatePickerModal] = useState<boolean>(false);
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();

    const { isPhoneView } = useDashboardContextHooks();

    const businessId = useMemo(() => {
        if (typeof window === "undefined") return;
        const id = sessionStorage.getItem("selectedBusinessId");
        return id ? JSON.parse(id) : 0;
    }, []);

    const branchId = useMemo(() => {
        if (typeof window === "undefined") return;
        const branch_id = sessionStorage.getItem("selectedBranchId");
        return branch_id ? JSON.parse(branch_id) : 0;
    }, []);

    useEffect(() => {
        if (periodSelected?.toLowerCase() === "custom") {
            setShowDatePickerModal(true);
            return;
        }
        setShowDatePickerModal(false);
        setSelectedDateRange(undefined);
    }, [periodSelected]);


    return (
        <>
            <Card className="dark:bg-black">
                <CardHeader>
                    <div className="w-full flex flex-col md:flex-row justify-between gap-y-1.5 md:items-center">
                        <div className="flex flex-col gap-y-1">
                            <CardTitle>Expense Generated</CardTitle>
                            <CardDescription>Expense generated for a particular period</CardDescription>
                        </div>
                        <div className="flex items-center gap-x-2">
                            <div className="flex items-center gap-x-1">
                                <div className="w-3 h-3 rounded-[4px] bg-template-chart-gas" />
                                <span className="text-[13px]">Expense</span>
                            </div>
                            <Select value={periodSelected} onValueChange={setPeriodSelected}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="day">Day</SelectItem>
                                    <SelectItem value="week">Week</SelectItem>
                                    <SelectItem value="month">Month</SelectItem>
                                    <SelectItem value="year">Year</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ExpenseBarChart periodSelected={periodSelected} selectedDateRange={selectedDateRange} branchId={branchId} businessId={businessId} />
                </CardContent>
            </Card>
            {showDatePickerModal && (
                <div className="fixed inset-0 overflow-y-auto z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="bg-white dark:bg-black rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:w-fit mx-auto sm:mx-4"
                    >
                        <div className="p-6">
                            <div className="flex justify-center mb-6">
                                <Card className="mx-auto overflow-y-auto w-fit p-0 border-none shadow-none bg-transparent">
                                    <CardContent className="p-0 flex">
                                        <Calendar
                                            mode="range"
                                            defaultMonth={selectedDateRange?.from}
                                            selected={selectedDateRange}
                                            onSelect={setSelectedDateRange}
                                            numberOfMonths={isPhoneView ? 1 : 2}
                                            className="p-3"
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            {selectedDateRange?.from && selectedDateRange?.to && (
                                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Selected Range:</span>{" "}
                                        {selectedDateRange.from.toLocaleDateString()} - {selectedDateRange.to.toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3 dark:text-white">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setShowDatePickerModal(false);
                                        setSelectedDateRange(undefined);
                                        setPeriodSelected("day");
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-template-primary hover:bg-template-primary/90"
                                    onClick={() => {
                                        if (selectedDateRange?.from && selectedDateRange?.to) {
                                            console.log('Selected date range:', selectedDateRange);
                                            setShowDatePickerModal(false);
                                        }
                                    }}
                                    disabled={!selectedDateRange?.from || !selectedDateRange?.to}
                                >
                                    Apply
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default ExpenseContentsGraph;