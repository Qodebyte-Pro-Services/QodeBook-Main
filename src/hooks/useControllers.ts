import { deleteAttributeById, deleteBudgetHandler, deleteCategoryById, deleteCouponsById, deleteDiscountsById, deleteExpenseHandler, deleteStaffBusinessSettings, deleteStaffCreds, deleteStaffDoc, deleteStaffShift, deleteTaxesById, deleteUserData } from "@/api/controllers/delete/handler";
import {  getProductAttributes, getBusinessBranches } from "@/api/controllers/get/handler";
import { userBusinessHandler } from "@/api/controllers/get/handler";
import { userBusinessesHandler } from "@/api/controllers/get/handler";
import { getUserproofile } from "@/api/controllers/get/user-data";
import { createExpense, createExpenseCategory, createStaffBusinessSettings, createStaffRole, createStaffShift, createStaffSubcharge, createSupplier, staffDocsUploading, updateStockSupplyOrderStatus, createBudget, createStaffSalary, transferAllBudgetHandler, transferABudgetHandler, createBusinessBranch, createBusinessHandler } from "@/api/controllers/post/product-handler";
import { updateBudgetHandler, updateBudgetStatus, updateExpenseCategory, updateExpensePaymentStatus, updateExpenseStatus, updateProductByIdHandler, updateStaffBusinessSettings, updateStaffShiftById, updateStaffSubcharge, updateStockSupplyOrder } from "@/api/controllers/put/handlers";
import { useMutation, useQuery } from "@tanstack/react-query";

const useUserData = () => {
    const {data, isSuccess, isLoading, isError, error} = useQuery({
        queryKey: ["user-data"],
        queryFn: getUserproofile,
        refetchOnWindowFocus: false,
        retry: false,
        retryOnMount: false,
    });

    return {data, isSuccess, isLoading, isError, error};
}

const useUserBusiness = (id: string) => {
    const {data, isError, error, isLoading, isSuccess} = useQuery({
        queryKey: ["user-business", id],
        queryFn: () => userBusinessHandler(id),
        refetchOnWindowFocus: 'always',
        retry: false,
    });

    return {data, isError, error, isLoading, isSuccess};
}

const useUserBusinesses = () => {
    const {data, isError, error, isLoading, isSuccess} = useQuery({
        queryKey: ["user-businesses"],
        queryFn: userBusinessesHandler,
        refetchOnWindowFocus: 'always',
        retry: false,
    });

    return {data, isError, error, isLoading, isSuccess};
}

const useBusinessBranches = (businessId: string) => {
    const {data, isError, error, isLoading, isSuccess} = useQuery({
        queryKey: ["business-branches", businessId],
        queryFn: () => getBusinessBranches(businessId),
        enabled: !!businessId,
        refetchOnWindowFocus: false,
    });

    return {data, isError, error, isLoading, isSuccess};
}


const useProductAttributesHandler = () => {
    return useMutation({
        mutationFn: getProductAttributes
    });
};

const useEditProductByIdHandler = () => {
    return useMutation({
        mutationFn: updateProductByIdHandler
    });
};

const useUpdateStockSupplyOrder = () => useMutation({
    mutationFn: updateStockSupplyOrder
});

const useUpdateSupplyOrderStatus = () => useMutation({
    mutationFn: updateStockSupplyOrderStatus
});

const useCreateStaffRoleHandler = () => {
    return useMutation({
        mutationFn: createStaffRole,
    });
};

const useStaffBusinessSettings = () => useMutation({
    mutationFn: createStaffBusinessSettings
});

const useDeleteUserAccount = () => useMutation({
    mutationFn: deleteUserData,
});

const useDeleteCategory = () => useMutation({
    mutationFn: deleteCategoryById
});

const useDeleteAttribute = () => useMutation({
    mutationFn: deleteAttributeById
});

const useDeleteTaxes = () => useMutation({
    mutationFn: deleteTaxesById
});

const useDeleteDiscount = () => useMutation({
    mutationFn: deleteDiscountsById
});

const useDeleteCoupons = () => useMutation({
    mutationFn: deleteCouponsById
});

const useDeleteStaffHandler = () => useMutation({
    mutationFn: deleteStaffCreds
});

const useStaffDocsHandler = () => useMutation({
    mutationFn: staffDocsUploading
});

const useStaffDeleteDocHandler = () => useMutation({
    mutationFn: deleteStaffDoc
})

const useStaffShiftHandler = () => useMutation({
    mutationFn: createStaffShift
});

const useStaffUpdateShiftHandler = () => useMutation({
    mutationFn: updateStaffShiftById
});

const useDeleteStaffShift = () => useMutation({
    mutationFn: deleteStaffShift
});

const useStaffSubchargesHandler = () => useMutation({
    mutationFn: createStaffSubcharge
})

const useStaffSubchargeUpdate = () => useMutation({
    mutationFn: updateStaffSubcharge
});

const useDeleteBusinessSettings = () => useMutation({
    mutationFn: deleteStaffBusinessSettings
});

const useExpenseCategoryHandler = () => useMutation({
    mutationFn: createExpenseCategory
});

const useExpenseHandler = () => useMutation({
    mutationFn: createExpense
});

const useBudgetHandler = () => useMutation({
    mutationFn: createBudget
});

const useStaffSalaryHandler = () => useMutation({
    mutationFn: createStaffSalary
});

const useExpenseStatusHandler = () => useMutation({
    mutationFn: updateExpenseStatus
});

const useExpensePaymentStatusHandler = () => useMutation({
    mutationFn: updateExpensePaymentStatus
});

const useUpdateBudgetHandler = () => useMutation({
    mutationFn: updateBudgetHandler
});

const useUpdateExpenseCategory = () => useMutation({
    mutationFn: updateExpenseCategory
});

const useUpdateStaffBusinessSettings = () => useMutation({
    mutationFn: updateStaffBusinessSettings
});

const useTransferAllBudgetHandler = () => useMutation({
    mutationFn: transferAllBudgetHandler
});

const useTransferBudgetHandler = () => useMutation({
    mutationFn: transferABudgetHandler
});

const useDeleteBudgetHandler = () => useMutation({
    mutationFn: deleteBudgetHandler
});

const useDeleteExpenseHandler = () => useMutation({
    mutationFn: deleteExpenseHandler
});

const useUpdateBudgetStatusHandler = () => useMutation({
    mutationFn: updateBudgetStatus
});

const useCreateBusinessBranch = () => useMutation({
    mutationFn: createBusinessBranch
});

const useCreateBusiness = () => useMutation({
    mutationFn: createBusinessHandler
});

export { 
    useUserData,
    useUserBusiness, 
    useUserBusinesses, 
    useProductAttributesHandler, 
    useEditProductByIdHandler, 
    useCreateStaffRoleHandler, 
    useStaffBusinessSettings,
    useDeleteUserAccount, 
    useUpdateStockSupplyOrder, 
    useDeleteAttribute, 
    useDeleteCategory, 
    useUpdateSupplyOrderStatus,
    useDeleteTaxes,
    useDeleteCoupons,
    useDeleteDiscount,
    useDeleteStaffHandler,
    useStaffDocsHandler,
    useStaffDeleteDocHandler,
    useStaffShiftHandler,
    useStaffUpdateShiftHandler,
    useDeleteStaffShift,
    useStaffSubchargesHandler,
    useStaffSubchargeUpdate,
    useDeleteBusinessSettings,
    useExpenseCategoryHandler,
    useExpenseHandler,
    useBudgetHandler,
    useStaffSalaryHandler,
    useExpenseStatusHandler,
    useExpensePaymentStatusHandler,
    useUpdateBudgetHandler,
    useUpdateExpenseCategory,
    useUpdateStaffBusinessSettings,
    useDeleteBudgetHandler,
    useDeleteExpenseHandler,
    useTransferAllBudgetHandler,
    useTransferBudgetHandler,
    useUpdateBudgetStatusHandler,
    useBusinessBranches,
    useCreateBusinessBranch,
    useCreateBusiness
};
