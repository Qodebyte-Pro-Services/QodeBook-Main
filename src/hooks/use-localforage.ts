"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { cartUtils, productCache, offlineOrders, networkUtils, isOnline, SalesReportQueryLogic, salesReportUtils, offlineCustomerUtils } from '@/lib/storage-utils';
import { initializeStorage } from '@/lib/localforage-config';
import { CouponResponseObj, CustomerResponse, DiscountResponseObj, ProductVariantResponseObject, TaxesResponseObj } from '@/models/types/shared/handlers-type';

export const useLocalForage = () => {
    const [isStorageReady, setIsStorageReady] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const init = async () => {
            const ready = await initializeStorage();
            setIsStorageReady(ready);
            setIsOffline(!isOnline());
        };
        init();
    }, []);

    useEffect(() => {
        const cleanup = networkUtils.setupNetworkListeners(
            () => setIsOffline(false),
            () => setIsOffline(true)
        );
        return cleanup;
    }, []);

    return {
        isStorageReady,
        isOffline,
        cartUtils,
        productCache,
        offlineOrders
    };
};

export const useCartStorage = () => {
    const [cart, setCart] = useState<(ProductVariantResponseObject & {maxQuantity?: number; unit?: string})[]>([]);
    const [customer, setCustomer] = useState<string>('0');
    const [storeType, setStoreType] = useState<string>('walk_in');
    const [isLoading, setIsLoading] = useState(true);
    const [discountsDTC, setDiscountsDTC] = useState<DiscountResponseObj[]>([]);
    const [taxesDTC, setTaxesDTC] = useState<TaxesResponseObj[]>([]);
    const [couponsDTC, setCouponsDTC] = useState<CouponResponseObj[]>([]);
    
    // State for matched DTC Maps
    const [matchedDiscounts, setMatchedDiscounts] = useState<Map<number, any[]>>(new Map());
    const [matchedTaxes, setMatchedTaxes] = useState<Map<number, any[]>>(new Map());
    const [matchedCoupons, setMatchedCoupons] = useState<Map<number, any[]>>(new Map());

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [savedCart, savedCustomer, savedStoreType, savedDiscounts, savedTaxes, savedCoupons, matchedDTCMaps] = await Promise.all([
                    cartUtils.getCart(),
                    cartUtils.getCustomer(),
                    cartUtils.getStoreType(),
                    cartUtils?.getSavedDTC("discounts"),
                    cartUtils?.getSavedDTC("taxes"),
                    cartUtils?.getSavedDTC("coupons"),
                    cartUtils.getMatchedDTCMaps()
                ]);

                setCart(savedCart);
                setCustomer(savedCustomer || '0');
                setStoreType(savedStoreType || 'walk_in');
                setDiscountsDTC(savedDiscounts as (DiscountResponseObj[] | []));
                setTaxesDTC(savedTaxes as (TaxesResponseObj[] | []));
                setCouponsDTC(savedCoupons as (CouponResponseObj[] | []));
                
                // Load matched DTC Maps
                setMatchedDiscounts(matchedDTCMaps.discounts);
                setMatchedTaxes(matchedDTCMaps.taxes);
                setMatchedCoupons(matchedDTCMaps.coupons);
            } catch (error) {
                console.error('Failed to load initial cart data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const updateCart = useCallback(async (newCart: (ProductVariantResponseObject & {maxQuantity?: number; unit?: string})[]) => {
        setCart(newCart);
        await cartUtils.saveCart(newCart);
    }, []);
    const updateCustomer = useCallback(async (newCustomer: string) => {
        setCustomer(newCustomer);
        await cartUtils.saveCustomer(newCustomer);
    }, []);
    const updateStoreType = useCallback(async (newStoreType: string) => {
        setStoreType(newStoreType);
        await cartUtils.saveStoreType(newStoreType);
    }, []);
    
    // Update functions for matched DTC Maps
    const updateMatchedDiscounts = useCallback(async (newMatchedDiscounts: Map<number, any[]>) => {
        setMatchedDiscounts(newMatchedDiscounts);
        await cartUtils.saveMatchedDTCMaps(newMatchedDiscounts, matchedTaxes, matchedCoupons);
    }, [matchedTaxes, matchedCoupons]);
    
    const updateMatchedTaxes = useCallback(async (newMatchedTaxes: Map<number, any[]>) => {
        setMatchedTaxes(newMatchedTaxes);
        await cartUtils.saveMatchedDTCMaps(matchedDiscounts, newMatchedTaxes, matchedCoupons);
    }, [matchedDiscounts, matchedCoupons]);
    
    const updateMatchedCoupons = useCallback(async (newMatchedCoupons: Map<number, any[]>) => {
        setMatchedCoupons(newMatchedCoupons);
        await cartUtils.saveMatchedDTCMaps(matchedDiscounts, matchedTaxes, newMatchedCoupons);
    }, [matchedDiscounts, matchedTaxes]);
    
    const clearAll = useCallback(async () => {
        setCart([]);
        setCustomer('0');
        setStoreType('walk_in');
        setMatchedDiscounts(new Map());
        setMatchedTaxes(new Map());
        setMatchedCoupons(new Map());
        await Promise.all([
            cartUtils.clearCart(),
            cartUtils.saveCustomer('0'),
            cartUtils.saveStoreType('walk_in'),
            cartUtils.clearMatchedDTCMaps()
        ]);
    }, []);

    return {
        cart,
        customer,
        storeType,
        isLoading,
        matchedDiscounts,
        matchedTaxes,
        matchedCoupons,
        updateCart,
        updateCustomer,
        updateStoreType,
        updateMatchedDiscounts,
        updateMatchedTaxes,
        updateMatchedCoupons,
        clearAll
    };
};

export const useOfflineOrders = () => {
    const [pendingOrders, setPendingOrders] = useState<any[]>([]);
    const loadPendingOrders = useCallback(async () => {
        const orders = await offlineOrders.getOfflineOrders();
        setPendingOrders(orders);
    }, []);

    const createOrder = useCallback(async (orderData: any, onlineSubmitFn?: (data: any) => Promise<boolean | { success: boolean; _data?: any }>) => {
        if (isOnline() && onlineSubmitFn) {
            try {
                const result = await onlineSubmitFn(orderData);
                const isSuccess = typeof result === 'boolean' ? result : result?.success;
                
                if (isSuccess) {
                    toast.success('Order created successfully');
                    const responseData = typeof result === 'object' ? result?._data : undefined;
                    return { success: true, isOffline: false, data: responseData };
                }
            } catch (error) {
                console.error('Online order failed, saving offline:', error);
            }
        }

        const offlineOrder = await offlineOrders.addOfflineOrder(orderData);
        await loadPendingOrders();
        return { success: !!offlineOrder, isOffline: true, data: offlineOrder };
    }, [loadPendingOrders]);

    const syncPendingOrders = useCallback(async (
        syncFn: (data: any) => Promise<{ success: boolean; _data?: any } | boolean>
    ) => {
        if (!isOnline()) return false;
        
        // Wrap the syncFn to ensure it returns a boolean
        const wrappedSyncFn = async (orderData: any) => {
            const result = await syncFn(orderData);
            return typeof result === 'boolean' ? result : result.success;
        };
        
        const success = await offlineOrders.syncOfflineOrders(wrappedSyncFn);
        await loadPendingOrders();
        return success;
    }, [loadPendingOrders]);

    const removeOfflineOrder = useCallback(async (orderId: string) => {
        const isRemoved = await offlineOrders.removeOfflineOrder(orderId);
        if (isRemoved) {
            toast.success('Pending order removed successfully');
            await loadPendingOrders();
            return true;
        }
        toast.error('Failed to remove pending order');
        return false;
    }, [loadPendingOrders]);

    useEffect(() => {
        loadPendingOrders();
    }, [loadPendingOrders]);

    return {
        pendingOrders,
        createOrder,
        syncPendingOrders,
        loadPendingOrders,
        removeOfflineOrder
    };
};


export const useSalesReport = () => {
    const updateSalesReport = useCallback(async (bid: number, data: Array<SalesReportQueryLogic>): Promise<boolean> => {
        try {
            const is_updated = await salesReportUtils?.setSalesReportQuery(bid, data) as boolean;
            return is_updated;
        }catch(err) {
            if (err instanceof Error) {
                console.log("Error Occurred While Trying To Update Sales Report", err);
                return false;
            }
            console.log("Unexpected Error Occurred while to update the sales report storage");
            return false;
        }
    }, []);

    const getSalesReportData = useCallback(async (bid: number) => {
        try {
            const data = await salesReportUtils?.getSalesReportQuery(bid);
            return data || [];
        }catch(err) {
            console.log("Failed To Get Sales Reports: ", err);
            return [];
        }
    }, []);

    const deleteSalesReport = useCallback( async(mapId: string, business_id: number) => {
        try {
            const is_removed = await salesReportUtils?.removeSalesReportItem(mapId, business_id);
            if (is_removed) {
                toast.success("Sales Report Item Removed Successfully", {
                    description: `Sales Report With An ID ${mapId} Has Been Removed`
                });
                return;
            }
            toast.error("Failed To Remove Item From The Sales Report", {
                description: `Sales Report With An Id ${mapId} Not Detected`
            });
            return;
        }catch(err) {
            if (err instanceof Error) {
                console.log("Error Occurred While Trying To Delete Item: ", err);
                return;
            }
            console.log("Unexpected Error Occurred while to Delete Item From the Sales Report Storage");
            return;
        }
    }, []);

    const clearSalesReport = useCallback(async (business_id: number) => {
        try {
            const is_cleared = await salesReportUtils?.clearSalesReportQuery(business_id);
            if (is_cleared) {
                toast.success('Sales Report Data Truncated Successfully', {
                    description: `Generated Sales Report Under Business ID ${business_id} Deleted`
                });
                return;
            }
            toast.success("Failed To Clear Sales Report Storage")
        }catch(err) {
            console.log("Clear Sales Error: ", err);
            return;
        }
    }, []);

    return {
        updateSalesReport,
        getSalesReportData,
        deleteSalesReport,
        clearSalesReport
    }
}

export const useOfflineCustomers = () => {
    const [offline_customers, set_offline_customers] = useState<CustomerResponse[]>([]);
    const setOfflineCustomers = useCallback(async (data: CustomerResponse[], businessId: number) => {
        try {
            const res = await offlineCustomerUtils.addCustomer(data, businessId);
            return res;
        }catch(err) {
            if (err instanceof Error) {
                console.log(err?.message);
                return false;
            }
            console.log('Unexpected error occurred while trying to set customers data');
            return false;
        }
    }, []);

    const getOfflineCustomers = useCallback(async(businessId: number) => {
        try {
            const resp = await offlineCustomerUtils.getCustomers(businessId);
            set_offline_customers(resp as CustomerResponse[]);
            return resp as CustomerResponse[];
        }catch(err) {
            if (err instanceof Error) {
                console.log(err?.message);
                set_offline_customers([]);
                return false;
            }
            set_offline_customers([]);
            console.log("Unexpected error occurred while trying to get customers");
            return false;
        }
    }, []);

    const clearCustomer = useCallback(async () => {
        try {
            const res = await offlineCustomerUtils?.clearCustomers();
            return res;
        }catch(err) {
            if (err instanceof Error) {
                console.log(err?.message);
                return false;
            }
            return false;
        }
    }, []);

    return {
        offline_customers,
        setOfflineCustomers,
        getOfflineCustomers,
        clearCustomer
    }
}