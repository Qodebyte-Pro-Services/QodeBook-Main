import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomStyles } from "@/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { GiPayMoney } from "react-icons/gi";
import { LiaTimesSolid } from "react-icons/lia";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getExpenseCategories, userBusinessesHandler } from "@/api/controllers/get/handler";
import { useEffect, useMemo, useState } from "react";
import { BusinessReponseLogic } from "./add-expense-category-form";
import { toast } from "sonner";
import { CgSpinnerTwo } from "react-icons/cg";
import { FiSave } from "react-icons/fi";
import { useBudgetHandler, useUpdateBudgetHandler } from "@/hooks/useControllers";
import { BudgetReponseLogic } from "../../tables/budget-table";

export type ExpenseCategoriesResponse = {
  id: number;
  business_id: number;
  name: string;
  description: string;
  created_at: string;
};

export type BudgetPayloadLogic = {
  business_id: number;
  category_id: number;
  amount: number;
  period_start: string;
  period_end: string;
  budget_month: string;
  budget_year: string;
};

const EditBudgetForm = ({ handleFormClose, data, businessId }: { handleFormClose: () => void; data: BudgetReponseLogic; businessId: number; }) => {
  const { hiddenScrollbar } = useCustomStyles();

  const queryClient = useQueryClient();
  const updateBudgetHandler = useUpdateBudgetHandler();

  const [budget, setBudget] = useState<BudgetPayloadLogic>({
    business_id: businessId || 0,
    category_id: 0,
    amount: +data?.amount || 0,
    period_start: data?.period_start || new Date().toISOString().split("T")[0],
    period_end: data?.period_end || new Date().toISOString().split("T")[0],
    budget_month: data?.budget_month || new Date().toLocaleString("en-US", { month: "long" }).toLowerCase(),
    budget_year: `${new Date().getFullYear()}`,
  });

  type BudgetErrorLogic = Record<keyof BudgetPayloadLogic, string>;
  const [errors, setErrors] = useState<BudgetErrorLogic>({
    business_id: "",
    category_id: "",
    amount: "",
    period_start: "",
    period_end: "",
    budget_month: "",
    budget_year: "",
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { data: expenseCategories = { categories: [] }, isLoading: expenseCategoryLoading, isSuccess: expenseCategorySuccess, isError: expenseCategoryError } = useQuery({
    queryKey: ["get-expense-categories", businessId],
    queryFn: () => getExpenseCategories(businessId),
    enabled: businessId !== 0,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const expense_categories = useMemo<ExpenseCategoriesResponse[]>(() => {
    if (expenseCategorySuccess && !expenseCategoryError) {
      console.log(expenseCategories?.categories);
      return expenseCategories?.categories || [];
    }
    return [];
  }, [expenseCategories, expenseCategorySuccess, expenseCategoryError]);

  const currentCategoryId = useMemo(() => {
    return expense_categories.find((category) => category?.name?.toLowerCase() === data?.category_name?.toLowerCase())?.id || 0;
  }, [expense_categories, data]);

  useEffect(() => {
    setBudget((prev) => ({ ...prev, category_id: currentCategoryId }));
  }, [currentCategoryId]);

  const months = useMemo(() => [
    "january","february","march","april","may","june","july","august","september","october","november","december"
  ], []);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => `${current - 3 + i}`);
  }, []);

  const validateField = (name: keyof BudgetPayloadLogic, value: string | number) => {
    let text = "";
    switch (name) {
      case "category_id":
        if (!value || +(value as number) <= 0) text = "Required";
        break;
      case "amount":
        if (!value || +(value as number) <= 0) text = "Amount must be greater than 0";
        break;
      case "period_start":
      case "period_end":
        if (!(value as string)) text = "Required";
        break;
      case "budget_month":
        if (!(value as string)?.trim()) text = "Required";
        break;
      case "budget_year":
        if (!(value as string)?.trim()) text = "Required";
        break;
    }
    return text;
  };

  const validateForm = () => {
    const newErrors = {} as BudgetErrorLogic;
    let isValid = true;

    (Object.keys(budget) as Array<keyof BudgetPayloadLogic>).forEach((key) => {
      const err = validateField(key, budget[key]);
      if (err) {
        newErrors[key] = err;
        isValid = false;
      }
    });

    if (budget.period_start && budget.period_end) {
      const start = new Date(budget.period_start);
      const end = new Date(budget.period_end);
      if (start > end) {
        newErrors.period_end = "End date must be after start date";
        isValid = false;
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleSelectNumber = (name: "category_id", value: string) => {
    setBudget((prev) => ({
      ...prev,
      [name]: +value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectString = (name: "budget_month" | "budget_year", value: string) => {
    setBudget((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = +e.target.value;
    setBudget((prev) => ({ ...prev, amount: value }));
    if (value > 0) setErrors((prev) => ({ ...prev, amount: "" }));
  };

  const handleDate = (name: "period_start" | "period_end") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBudget((prev) => ({ ...prev, [name]: value }));
    if (value) setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "period_start" && value) {
      const d = new Date(value);
      const month = d.toLocaleString("en-US", { month: "long" }).toLowerCase();
      const year = `${d.getFullYear()}`;
      setBudget((prev) => ({ ...prev, budget_month: month, budget_year: year }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    const payload: BudgetPayloadLogic & {id: number} = { ...budget, id: data?.id};
    try {
      await updateBudgetHandler.mutateAsync(payload, {
        onSuccess(data) {
          toast.success(data?.message || "Budget updated successfully");
          queryClient.invalidateQueries({
            queryKey: ["get-budgets", payload.business_id],
            refetchType: "active",
          });
          setBudget((prev) => ({
            ...prev,
            category_id: 0,
            amount: 0,
            period_start: new Date().toISOString().split("T")[0],
            period_end: new Date().toISOString().split("T")[0],
            budget_month: new Date().toLocaleString("en-US", { month: "long" }).toLowerCase(),
            budget_year: `${new Date().getFullYear()}`,
          }));
          setTimeout(() => {
            handleFormClose?.();
          }, 1200);
        },
        onError(err) {
          toast.error(err?.message || "Error occurred while trying to create budget");
        },
      });
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err?.message || "Error occurred while trying to create budget");
      } else {
        toast.error("Unexpected error occurred while trying to create budget");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          transition={{ ease: "easeInOut", duration: 0.25 }}
          className="relative z-20 w-[92%] mx-auto md:max-w-xl shadow-2xl rounded-xl overflow-hidden"
        >
          <div className="py-5 px-5 md:px-6 bg-gradient-to-r from-template-primary via-template-primary/80 to-template-primary/40">
            <div className="flex items-center gap-x-2">
              <div className="w-10 h-10 rounded-md flex items-center justify-center bg-white/10">
                <GiPayMoney size={22} className="text-white" />
              </div>
              <div className="space-y-0.5">
                <div className="text-base md:text-lg font-[600] text-white">Create Budget</div>
                <div className="text-[11px] md:text-xs font-[450] text-template-whitesmoke/80 text-shadow-2xs">Plan your expenses by category, period, and amount</div>
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
                      <SelectValue placeholder="Loading Categories..." />
                    </SelectTrigger>
                  </Select>
                )}
                {!expenseCategoryLoading && (
                  <Select value={`${budget?.category_id}`} onValueChange={(val) => handleSelectNumber("category_id", val)}>
                    <SelectTrigger className={`w-full py-2.5 px-2 border ${errors.category_id ? "border-red-400" : "border-gray-300"} focus:ring-2 focus:ring-template-primary/60`}>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expense_categories?.length <= 0 && <SelectItem value="0">No Available Category</SelectItem>}
                      {expense_categories?.map((val, idx) => (
                        <SelectItem key={`budget-category-list-${idx}`} value={`${val?.id}`}>{val?.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.category_id ? <span className="text-[11px] text-red-500 mt-1">{errors.category_id}</span> : null}
              </div>

              <div className="flex flex-col gap-y-0.5">
                <div className="text-[12px] md:text-[13px] font-[600]">Amount <span className="text-red-500">*</span></div>
                <input
                  onChange={handleAmount}
                  value={budget.amount}
                  type="number"
                  min={0}
                  className={`py-2.5 px-3 w-full border ${errors.amount ? "border-red-400" : "border-gray-300"} rounded-md text-sm font-[550] focus:outline-none focus:ring-2 focus:ring-template-primary/60`}
                  placeholder="0.00"
                />
                {errors.amount ? <span className="text-[11px] text-red-500 mt-1">{errors.amount}</span> : <span className="text-[11px] text-gray-500/80 mt-1">Enter budget amount</span>}
              </div>

              <div className="flex flex-col gap-y-0.5">
                <div className="text-[12px] md:text-[13px] font-[600]">Period Start <span className="text-red-500">*</span></div>
                <input
                  onChange={handleDate("period_start")}
                  type="date"
                  value={budget.period_start}
                  className={`py-2.5 px-3 w-full border ${errors.period_start ? "border-red-400" : "border-gray-300"} rounded-md text-sm font-[550] focus:outline-none focus:ring-2 focus:ring-template-primary/60`}
                />
                {errors.period_start ? <span className="text-[11px] text-red-500 mt-1">{errors.period_start}</span> : null}
              </div>

              <div className="flex flex-col gap-y-0.5">
                <div className="text-[12px] md:text-[13px] font-[600]">Period End <span className="text-red-500">*</span></div>
                <input
                  onChange={handleDate("period_end")}
                  type="date"
                  value={budget.period_end}
                  className={`py-2.5 px-3 w-full border ${errors.period_end ? "border-red-400" : "border-gray-300"} rounded-md text-sm font-[550] focus:outline-none focus:ring-2 focus:ring-template-primary/60`}
                />
                {errors.period_end ? <span className="text-[11px] text-red-500 mt-1">{errors.period_end}</span> : null}
              </div>

              <div className="flex flex-col gap-y-0.5">
                <div className="text-[12px] md:text-[13px] font-[600]">Budget Month <span className="text-red-500">*</span></div>
                <Select value={budget.budget_month} onValueChange={(val) => handleSelectString("budget_month", val)}>
                  <SelectTrigger className={`w-full py-2.5 px-2 border ${errors.budget_month ? "border-red-400" : "border-gray-300"} focus:ring-2 focus:ring-template-primary/60`}>
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m, idx) => (
                      <SelectItem key={`budget-month-${idx}`} value={m}>
                        {m.replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.budget_month ? <span className="text-[11px] text-red-500 mt-1">{errors.budget_month}</span> : null}
              </div>

              <div className="flex flex-col gap-y-0.5">
                <div className="text-[12px] md:text-[13px] font-[600]">Budget Year <span className="text-red-500">*</span></div>
                <Select value={budget.budget_year} onValueChange={(val) => handleSelectString("budget_year", val)}>
                  <SelectTrigger className={`w-full py-2.5 px-2 border ${errors.budget_year ? "border-red-400" : "border-gray-300"} focus:ring-2 focus:ring-template-primary/60`}>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y, idx) => (
                      <SelectItem key={`budget-year-${idx}`} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.budget_year ? <span className="text-[11px] text-red-500 mt-1">{errors.budget_year}</span> : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between sm:justify-start items-center gap-y-2 gap-x-4 py-4 px-4 md:px-6 rounded-b-xl bg-white">
            <button onClick={() => handleFormClose()} className="max-[640px]:w-full cursor-pointer py-2 px-10 bg-gray-100 hover:bg-gray-200 text-black rounded-md transition-all duration-200">
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="max-[640px]:w-full cursor-pointer py-2 px-5 bg-template-primary hover:bg-template-primary/90 text-white rounded-md flex items-center justify-center gap-x-2 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <CgSpinnerTwo size={18} className="animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <FiSave size={16} />
                  <span>Update Budget</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EditBudgetForm;
