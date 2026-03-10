import { submitOfflineOrder, submitOrder } from "@/api/controllers/post/orders";
import { createAttributeBulk, createCategory, createProductHandler, createSupplier, createOrderFormHandler, createProductOrder, createBusinessBranch, createProductVariantAdjustment, createStaffCreation, createTaxForm, createDiscountForm, createSalesCoupon } from "@/api/controllers/post/product-handler";
import { createCustomerHandler } from "@/api/controllers/post/user-handler";
import { updateAttribute, updateCategory, updateProductVariants, updateTaxes, updateDiscounts, updateCoupons, updateStaffCreds } from "@/api/controllers/put/handlers";
import { useMutation } from "@tanstack/react-query";

const useAttributeBulkHandler = () => {
    return useMutation({
        mutationFn: createAttributeBulk
    })
}

const useCategoryHandler = () => {
    return useMutation({
        mutationFn: createCategory
    })
}

const useCategoryUpdateHandler = () => {
    return useMutation({
        mutationFn: updateCategory
    })
}

const useAttributeUpdateHandler = () => {
    return useMutation({
        mutationFn: updateAttribute
    })
}

const useProductHandler = () => {
    return useMutation({
        mutationFn: createProductHandler
    })
}

const useSuppliersHandler = () => {
    return useMutation({
        mutationFn: createSupplier
    });
}

const useOrderHandler = () => {
    return useMutation({
        mutationFn: createOrderFormHandler
    });
}

const useProductOrderHandler = () => {
    return useMutation({
        mutationFn: createProductOrder
    });
};


const useBranchHandler = () => {
    return useMutation({
        mutationFn: createBusinessBranch
    });
};

const useProductVariantsHandler = () => {
    return useMutation({
        mutationFn: createProductVariantAdjustment
    })
};

const useVariantProductEditHandler = () => {
    return useMutation({
        mutationFn: updateProductVariants
    })
}

const useCustomerHandler = () => {
    return useMutation({
        mutationFn: createCustomerHandler
    })
}

const useStaffCreation = () => {
    return useMutation({
        mutationFn: createStaffCreation
    })
}

const useSalesOnlineHandler = () => {
    return useMutation({
        mutationFn: submitOrder
    });
}

const useSalesOfflineHandler = () => {
    return useMutation({
        mutationFn: submitOfflineOrder
    });
}

const useTaxesHandler = () => {
    return useMutation({
        mutationFn: createTaxForm
    });
};

const useDiscountHandler = () => {
    return useMutation({
        mutationFn: createDiscountForm
    })
}

const useSalesCouponHandler = () => useMutation({
    mutationFn: createSalesCoupon
});

const useUpdateTaxesHandler = () => {
    return useMutation({
        mutationFn: updateTaxes
    });
}

const useUpdateDiscountsHandler = () => {
    return useMutation({
        mutationFn: updateDiscounts
    });
}

const useUpdateCouponsHandler = () => {
    return useMutation({
        mutationFn: updateCoupons
    });
}

const useUpdateStaffListform = () => useMutation({
    mutationFn: updateStaffCreds
})

export {useAttributeBulkHandler, useCategoryHandler, useCategoryUpdateHandler, useAttributeUpdateHandler, useProductHandler, useSuppliersHandler, useOrderHandler, useProductOrderHandler, useBranchHandler, useProductVariantsHandler, useVariantProductEditHandler, useCustomerHandler, useStaffCreation, useSalesOnlineHandler, useSalesOfflineHandler, useTaxesHandler, useDiscountHandler, useSalesCouponHandler, useUpdateTaxesHandler, useUpdateDiscountsHandler, useUpdateCouponsHandler, useUpdateStaffListform};
