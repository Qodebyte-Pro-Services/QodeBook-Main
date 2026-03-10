import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomStyles } from "@/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { GiPayMoney } from "react-icons/gi";
import { LiaTimesSolid } from "react-icons/lia";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getExpenseCategories } from "@/api/controllers/get/handler";
import { useMemo, useState } from "react";
import { useExpenseHandler } from "@/hooks/useControllers";
import { toast } from "sonner";
import { CgSpinnerTwo } from "react-icons/cg";
import { FiSave } from "react-icons/fi";

export type ExpenseCategoriesResponse = {
    id: number;
    business_id: number;
    name: string;
    description: string;
    created_at: string;
};

export type ExpensePayloadLogic = {
    business_id: number;
    category_id: number;
    amount: number;
    description: string;
    expense_date: string;
    receipt?: File | FileList;
    payment_method: string;
};

const CreateExpenseForm = ({ handleFormClose, businessId }: { handleFormClose: () => void; businessId: number; }) => {
    const { hiddenScrollbar } = useCustomStyles();

    const createExpenseHandler = useExpenseHandler();
    const queryClient = useQueryClient();

    const [expense, setExpense] = useState<ExpensePayloadLogic>({
        business_id: businessId || 0,
        category_id: 0,
        amount: 0,
        description: "",
        expense_date: new Date()?.toISOString()?.split("T")[0],
        payment_method: "",
    });

    const [receiptName, setReceiptName] = useState<string>("");

    type ExpenseErrorLogic = Record<keyof Omit<ExpensePayloadLogic, "receipt">, string>;
    const [errors, setErrors] = useState<ExpenseErrorLogic>({
        business_id: "",
        category_id: "",
        amount: "",
        description: "",
        expense_date: "",
        payment_method: "",
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const { data: expenseCategories = { categories: [] }, isLoading: expenseCategoryLoading, isSuccess: expenseCategorySuccess, isError: expenseCategoryError } = useQuery({
        queryKey: ["get-expense-categories", businessId],
        queryFn: () => getExpenseCategories(businessId),
        enabled: businessId !== 0,
        refetchOnWindowFocus: false,
        retry: false
    });

    const expense_categories = useMemo<ExpenseCategoriesResponse[]>(() => {
        if (expenseCategorySuccess && !expenseCategoryError) {
            return expenseCategories?.categories || [];
        }
        return [];
    }, [expenseCategories, expenseCategorySuccess, expenseCategoryError]);

    const payment_methods = useMemo(() => {
        return ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'mobile_payment', 'other'];
    }, []);

    const validateField = (name: keyof ExpensePayloadLogic, value: string | number) => {
        let text = "";
        switch (name) {
            case "business_id":
            case "category_id":
                if (!value || +(value as number) <= 0) text = "Required";
                break;
            case "amount":
                if (!value || +(value as number) <= 0) text = "Amount must be greater than 0";
                break;
            case "description":
                if (!(value as string)?.trim()) text = "Description is required";
                break;
            case "expense_date":
                if (!(value as string)) text = "Date is required";
                break;
            case "payment_method":
                if (!(value as string)?.trim()) text = "Payment method is required";
                break;
        }
        return text;
    }

    const validateForm = () => {
        const newErrors = {} as ExpenseErrorLogic;
        let isValid = true;
        (Object.keys(expense) as Array<keyof Omit<ExpensePayloadLogic, "receipt">>).forEach((key) => {
            const err = validateField(key, expense[key]);
            if (err) {
                newErrors[key] = err;
                isValid = false;
            }
        });
        setErrors(prev => ({ ...prev, ...newErrors }));
        return isValid;
    }

    const handleSelectNumber = (name: 'business_id' | 'category_id', value: string) => {
        setExpense(prev => ({
            ...prev,
            [name]: +value
        }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    }

    const handleSelectString = (name: 'staff_id' | 'payment_method', value: string) => {
        setExpense(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    }

    const handleAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = +e.target.value;
        setExpense(prev => ({ ...prev, amount: value }));
        if (value > 0) setErrors(prev => ({ ...prev, amount: "" }));
    }

    const handleDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setExpense(prev => ({ ...prev, expense_date: value }));
        if (value) setErrors(prev => ({ ...prev, expense_date: "" }));
    }

    const handleDesc = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setExpense(prev => ({ ...prev, description: value }));
        if (value?.trim()) setErrors(prev => ({ ...prev, description: "" }));
    }

    const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.files?.[0];
        setReceiptName(value?.name || "");
        setExpense(prev => ({ ...prev, receipt: value }));
    }

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);
        const payload: ExpensePayloadLogic = { ...expense };
        try {
            await createExpenseHandler.mutateAsync(payload, {
                onSuccess(data) {
                    toast.success(data?.message || "Expense created successfully");
                    queryClient.invalidateQueries({
                        queryKey: ["get-expenses", payload.business_id],
                        refetchType: "active"
                    });
                    setExpense(prev => ({
                        ...prev,
                        category_id: 0,
                        amount: 0,
                        description: "",
                        payment_method: "",
                        expense_date: new Date()?.toISOString()?.split("T")[0]
                    }));
                    setTimeout(() => {
                        handleFormClose?.();
                    }, 1200);
                },
                onError(err) {
                    toast.error(err?.message || "Error occurred while trying to create expense");
                }
            });
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err?.message || "Error occurred while trying to create expense");
            } else {
                toast.error("Unexpected error occurred while trying to create expense");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <AnimatePresence>
                <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} transition={{ ease: "easeInOut", duration: 0.25 }} className="relative z-20 w-[92%] mx-auto md:max-w-xl shadow-2xl rounded-xl overflow-hidden">
                    <div className="py-5 px-5 md:px-6 bg-gradient-to-r from-template-primary via-template-primary/80 to-template-primary/40">
                        <div className="flex items-center gap-x-2">
                            <div className="w-10 h-10 rounded-md flex items-center justify-center bg-white/10">
                                <GiPayMoney size={22} className="text-white" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-base md:text-lg font-[600] text-white">Add Expense</div>
                                <div className="text-[11px] md:text-xs font-[450] text-template-whitesmoke/80 text-shadow-2xs">Record a new expense with category, staff, date, amount and payment method</div>
                            </div>
                        </div>
                        <div onClick={() => handleFormClose()} className="absolute top-3 right-3 w-8 h-8 rounded-md hover:bg-template-whitesmoke/90 group cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center">
                            <LiaTimesSolid size={18} className="text-white group-hover:text-black transition-all duration-300 ease-in-out" />
                        </div>
                    </div>
                    <div className="max-h-[65vh] bg-gradient-to-b from-white to-gray-50 px-4.5 md:px-6 pt-5 h-fit overflow-y-auto overflow-x-hidden" style={{ ...hiddenScrollbar }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div className="flex flex-col gap-y-0.5">
                                <div className="text-[12px] md:text-[13px] font-[600]">Category <span className="text-red-500">*</span></div>
                                {expenseCategoryLoading && (
                                    <Select>
                                        <SelectTrigger className="w-full py-2.5 px-2 border-gray-300 focus:ring-2 focus:ring-template-primary/60">
                                            <SelectValue placeholder="Loading Expense Categories..." />
                                        </SelectTrigger>
                                    </Select>
                                )}
                                {!expenseCategoryLoading && (
                                    <Select value={`${expense.category_id}`} onValueChange={val => handleSelectNumber('category_id', val)}>
                                        <SelectTrigger className={`w-full py-2.5 px-2 border ${errors.category_id ? 'border-red-400' : 'border-gray-300'} focus:ring-2 focus:ring-template-primary/60`}>
                                            <SelectValue placeholder="Select Expense Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {expense_categories?.length <= 0 && (
                                                <SelectItem value="0">No Available Expense Category</SelectItem>
                                            )}
                                            {expense_categories?.map((val, idx) => (
                                                <SelectItem key={`expense-category-list-${idx}`} value={`${val?.id}`}>{val?.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                {errors.category_id ? (<span className="text-[11px] text-red-500 mt-1">{errors.category_id}</span>) : null}
                            </div>
                            <div className="flex flex-col gap-y-0.5">
                                <div className="text-[12px] md:text-[13px] font-[600]">Amount <span className="text-red-500">*</span></div>
                                <input onChange={handleAmount} value={expense.amount} type="number" min={0} className={`py-2.5 px-3 w-full border ${errors.amount ? 'border-red-400' : 'border-gray-300'} rounded-md text-sm font-[550] focus:outline-none focus:ring-2 focus:ring-template-primary/60`} placeholder="0.00" />
                                {errors.amount ? (<span className="text-[11px] text-red-500 mt-1">{errors.amount}</span>) : (<span className="text-[11px] text-gray-500/80 mt-1">Enter amount paid</span>)}
                            </div>
                            <div className="flex flex-col gap-y-0.5">
                                <div className="text-[12px] md:text-[13px] font-[600]">Expense Date <span className="text-red-500">*</span></div>
                                <input onChange={handleDate} type="date" value={expense.expense_date} className={`py-2.5 px-3 w-full border ${errors.expense_date ? 'border-red-400' : 'border-gray-300'} rounded-md text-sm font-[550] focus:outline-none focus:ring-2 focus:ring-template-primary/60`} />
                                {errors.expense_date ? (<span className="text-[11px] text-red-500 mt-1">{errors.expense_date}</span>) : null}
                            </div>
                            <div className="flex flex-col gap-y-0.5">
                                <div className="text-[12px] md:text-[13px] font-[600]">Payment Method <span className="text-red-500">*</span></div>
                                <Select value={expense.payment_method} onValueChange={val => handleSelectString('payment_method', val)}>
                                    <SelectTrigger className={`w-full py-2.5 px-2 border ${errors.payment_method ? 'border-red-400' : 'border-gray-300'} focus:ring-2 focus:ring-template-primary/60`}>
                                        <SelectValue placeholder="Select A Payment Method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {payment_methods?.length && payment_methods?.map((val, idx) => (
                                            <SelectItem key={`expense-payment-method-${idx}`} value={val}>{val?.replace(/\_/g, " ")?.toUpperCase()}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.payment_method ? (<span className="text-[11px] text-red-500 mt-1">{errors.payment_method}</span>) : null}
                            </div>
                            <div className="md:col-span-2 flex flex-col gap-y-0.5">
                                <div className="text-[12px] md:text-[13px] font-[600]">Receipt <span className="text-red-500">*</span></div>
                                <input type="file" onChange={handleReceiptChange} className="py-2.5 px-3 w-full border border-gray-300 rounded-md text-sm font-[550] focus:outline-none focus:ring-2 focus:ring-template-primary/60" />
                                {<span className="text-[11px] text-red-500 mt-1">{receiptName}</span>}
                            </div>
                            <div className="md:col-span-2 flex flex-col gap-y-0.5">
                                <div className="text-[12px] md:text-[13px] font-[600]">Description <span className="text-red-500">*</span></div>
                                <textarea onChange={handleDesc} rows={4} name="description" id="description" value={expense.description} placeholder="Briefly describe the expense..." className={`resize-y border ${errors.description ? 'border-red-400' : 'border-gray-300'} rounded-md py-2.5 px-4 text-sm font-[550] focus:outline-none focus:ring-2 focus:ring-template-primary/60`}></textarea>
                                {errors.description ? (<span className="text-[11px] text-red-500 mt-1">{errors.description}</span>) : null}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between sm:justify-start items-center gap-y-2 gap-x-4 py-4 px-4 md:px-6 rounded-b-xl bg-white">
                        <button className="max-[640px]:w-full cursor-pointer py-2 px-10 bg-gray-100 hover:bg-gray-200 text-black rounded-md transition-all duration-200" onClick={handleFormClose}>Cancel</button>
                        <button disabled={isSubmitting} onClick={handleSubmit} className="max-[640px]:w-full cursor-pointer py-2 px-5 bg-template-primary hover:bg-template-primary/90 text-white rounded-md flex items-center justify-center gap-x-2 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-70">
                            {isSubmitting ? (
                                <>
                                    <CgSpinnerTwo size={18} className="animate-spin" />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <FiSave size={16} />
                                    <span>Create Expense</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

export default CreateExpenseForm;