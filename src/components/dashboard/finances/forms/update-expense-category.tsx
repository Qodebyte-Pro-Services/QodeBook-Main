import { useCustomStyles } from "@/hooks";
import {AnimatePresence, motion} from "framer-motion";
import { GiPayMoney } from "react-icons/gi";
import { LiaTimesSolid } from "react-icons/lia";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {  useUpdateExpenseCategory } from "@/hooks/useControllers";
import { toast } from "sonner";
import { CgSpinnerTwo } from "react-icons/cg";
import { ExpenseCategoriesResponse } from "./add-expense";

export type BusinessReponseLogic = {
    id: number;
    user_id: number;
    business_name: string;
    business_type: string;
    address: string;
    business_phone: string;
    logo_url: string;
    created_at: string;
};

export type ExpenseCategoryLogic = {
    business_id: number;
    name: string;
    description: string;
}

type ExpenseCategoryErrorLogic = {
    business_id: string;
    name: string;
    description: string;
}

const UpdateExpenseCategory = ({handleFormClose, businessId, data}: {handleFormClose: () => void; businessId?: number; data: ExpenseCategoriesResponse}) => {
    const [expenseCategory, setExpenseCategory] = useState<ExpenseCategoryLogic>({
        business_id: businessId || 0,
        description: data?.description || "",
        name: data?.name || ""
    });

    const [, setExpenseCategoryError] = useState<ExpenseCategoryErrorLogic>({
        business_id: "",
        description: "",
        name: ""
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const {hiddenScrollbar} = useCustomStyles();

    const updateHandler = useUpdateExpenseCategory();

    const queryClient = useQueryClient();

    const validateInput = (name: string, value: string | number) => {
        let text;
        switch(name) {
            case "name":
                if (!(value as string).trim()) {
                    text = "Expense Category Name Is Required";
                } else if (/^[\d]$/g.test(value as string)) {
                    text = "Expense Category Name Require Only Alphabets Or Alphanumerics"
                }
                break;
            case "description":
                if (!(value as string).trim()) {
                    text = "Description Is Required";
                }
                break;
            default:
                if (!value) {
                    text = "Business ID Is Required";
                }
                break;
        }
        return text;
    }

    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        const payloadKey = name?.split(/\_/)?.length ? name?.split(/\_/)?.[name?.split(/\_/).length - 1] : name;
        setExpenseCategory(prev => ({
            ...prev,
            [payloadKey]: value
        }));
        if (value) {
            setExpenseCategoryError(prev => ({
                ...prev,
                [payloadKey as keyof ExpenseCategoryErrorLogic]: ""
            }));
        }
    }

    const validateForm = () => {
        const newErrors = {} as Record<keyof ExpenseCategoryErrorLogic, string>;
        let isValid = true;
        Object.entries(expenseCategory)?.forEach(([key, value]) => {
            const errors = validateInput(key, value);
            if (errors) {
                Object.assign(newErrors, {[key]: errors});
            }
        });
        if (Object.entries(newErrors)?.filter(([, value]) => Boolean(value)).length) {
            setExpenseCategoryError(prev => ({
                ...prev,
                ...newErrors 
            }));
            isValid = false;
        }
        return isValid;
    }

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);
        const payload = {
            ...expenseCategory,
            id: data?.id
        };
        try {
            await updateHandler.mutateAsync(payload, {
                onSuccess(data) {
                    toast.success(data?.message || "Expense Category Updated Successfully");
                    queryClient.invalidateQueries({
                        queryKey: ["get-expense-category", payload?.business_id],
                        refetchType: "active"
                    });
                    Object.keys(expenseCategory)?.forEach(item => {
                        setExpenseCategory(prev => ({
                            ...prev,
                            [item as keyof ExpenseCategoryLogic]: ""
                        }));
                    });
                    setTimeout(() => {
                        handleFormClose?.();
                    }, 1500);
                },
                onError(err) {
                    toast.error(err?.message || "Error Occurred while trying to create expense category");
                    
                }
            })
        }catch(err) {
            if (err instanceof Error) {
                toast.error(err?.message || "Error occurred while trying to create Expense category");
                return;
            }
            toast.error("Unexpected error occurred while trying to create Expense category");
        } finally {
            setIsSubmitting(false);
        }
    }

    return(
        <div className="fixed inset-0 z-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <AnimatePresence>
                <motion.div initial={{y: -5, opacity: 0}} animate={{x: 0, opacity: 1}} exit={{y: -5, opacity: 0}} transition={{ease: "easeInOut", duration: 0.3}} className="relative z-20 w-[90%] mx-auto md:max-w-md">
                    <div className="py-5 px-4 rounded-tl-xl rounded-tr-xl bg-gradient-to-r from-template-primary via-template-primary/80 to-template-primary/40">
                        <div className="flex items-center gap-x-2">
                            <div className="w-9 h-9 rounded-md flex items-center justify-center">
                                <GiPayMoney size={22} className="text-white" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-base font-[550] text-white">Update Expense Category</div>
                                <div className="text-xs font-[450] text-template-whitesmoke/70 text-shadow-2xs">Use this feature to update the existing expense category. Modify the details such as; Category, and the description</div>
                            </div>
                        </div>
                        <div onClick={() => handleFormClose()} className="absolute top-[3%] right-[3%] w-8 h-8 rounded-md hover:bg-template-whitesmoke group cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center">
                            <LiaTimesSolid size={18} className="text-white group-hover:text-black transition-all duration-300 ease-in-out" />
                        </div>
                    </div>
                    <div className="max-h-[60vh] bg-white px-4.5 pt-5 h-fit overflow-y-auto overflow-x-hidden" style={{...hiddenScrollbar}}>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex flex-col gap-y-0.5">
                                <div className="text-[13px] font-[500]">Category Name</div>
                                <input onChange={handleInput} type="text" value={expenseCategory?.name} name="category_name" className="py-2 px-3 w-full border border-gray-500/30 rounded-md text-sm font-[550]" placeholder="Category name" />
                            </div>
                            <div className="flex flex-col gap-y-0.5">
                                <div className="text-[13px] font-[500]">Description</div>
                                <textarea onChange={handleInput} rows={3} value={expenseCategory.description} name="description" id="description" className="resize-y border border-gray-500/30 rounded-md py-2 px-4 text-sm font-[550]"></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-start items-center gap-y-2 gap-x-4 py-4 px-4 rounded-bl-xl rounded-br-xl bg-white">
                        <button className="max-[640px]:w-full cursor-pointer py-2 px-10 bg-template-whitesmoke text-black rounded-md">Cancel</button>
                        <button disabled={isSubmitting} onClick={handleSubmit} className="max-[640px]:w-full cursor-pointer py-2 px-4 bg-template-primary text-white rounded-md flex items-center justify-center gap-x-2">
                            {isSubmitting ? (
                                <>
                                    <CgSpinnerTwo size={18} className="animate-spin" />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <span>Update Category</span>
                            )}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence> 
        </div>
    );
}

export default UpdateExpenseCategory;