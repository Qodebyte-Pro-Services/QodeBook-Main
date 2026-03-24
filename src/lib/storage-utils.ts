/* eslint-disable @typescript-eslint/no-explicit-any */

import { toast } from 'sonner';
import { cartStorage, productStorage, orderStorage, discountStorage, taxStorage, couponStorage, STORAGE_KEYS, salesReportStorage, offlineCustomers } from './localforage-config';
import { CouponResponseObj, CustomerResponse, DiscountResponseObj, ProductVariantResponseObject, TaxesResponseObj } from '@/models/types/shared/handlers-type';

export const cartUtils = {
    async saveCart(variants: (ProductVariantResponseObject & {maxQuantity?: number})[]) {
        try {
            await cartStorage.setItem(STORAGE_KEYS.CART, variants);
            return true;
        } catch (error) {
            console.error('Failed to save cart:', error);
            return false;
        }
    },

    async getCart(): Promise<(ProductVariantResponseObject & {maxQuantity?: number})[]> {
        try {
            const cart = await cartStorage.getItem<(ProductVariantResponseObject & {maxQuantity?: number})[]>(STORAGE_KEYS.CART);
            return cart || [];
        } catch (error) {
            console.error('Failed to get cart:', error);
            return [];
        }
    },

    async clearCart() {
        try {
            await cartStorage.removeItem(STORAGE_KEYS.CART);
            return true;
        } catch (error) {
            console.error('Failed to clear cart:', error);
            return false;
        }
    },

    async saveCustomer(customerId: string) {
        try {
            await cartStorage.setItem(STORAGE_KEYS.CUSTOMER, customerId);
            return true;
        } catch (error) {
            console.error('Failed to save customer:', error);
            return false;
        }
    },

    async getCustomer(): Promise<string> {
        try {
            const customer = await cartStorage.getItem<string>(STORAGE_KEYS.CUSTOMER);
            return customer || '';
        } catch (error) {
            console.error('Failed to get customer:', error);
            return '';
        }
    },

    async saveStoreType(storeType: string) {
        try {
            await cartStorage.setItem(STORAGE_KEYS.STORE_TYPE, storeType);
            return true;
        } catch (error) {
            console.error('Failed to save store type:', error);
            return false;
        }
    },

    async getStoreType(): Promise<string> {
        try {
            const storeType = await cartStorage.getItem<string>(STORAGE_KEYS.STORE_TYPE);
            return storeType || '';
        } catch (error) {
            console.error('Failed to get store type:', error);
            return '';
        }
    },
    
    async saveVariantDTC(_name: string, _data: (DiscountResponseObj | TaxesResponseObj | CouponResponseObj)[]): Promise<boolean> {
        try {
            await cartStorage.setItem(`selected-variaint-${_name}`, _data);
            return true;
        }catch(err) {
            if (err instanceof Error) {
                console.log(err);
                return false;
            }
            console.log("Unexpected Error Occurred while trying to save variants DTC");
            return false;
        }
    },

    async getSavedDTC(_name: string): Promise<(DiscountResponseObj | TaxesResponseObj | CouponResponseObj)[]>  {
        try {
            const res = await cartStorage.getItem<(DiscountResponseObj | TaxesResponseObj | CouponResponseObj)[]>(`selected-variant-${_name}`);
            return res || [];
        }catch(err) {
            if (err instanceof Error) {
                console.log(err);
                return [];
            }
            console.log("Unexpected Error Occurred while trying to get variants DTC");
            return [];
        }
    },

    async removeSavedDTC(_name: string): Promise<boolean> {
        try {
            await cartStorage.removeItem(`selected-variaint-${_name}`);
            return true;
        }catch(err) {
            if (err instanceof Error) {
                console.log(err);
                return false;
            }
            console.log("Unexpected Error Occurred while trying to remove variants DTC");
            return false;
        }
    },

    // Functions for storing matched DTC Maps
    async saveMatchedDTCMaps(discounts: Map<number, any[]>, taxes: Map<number, any[]>, coupons: Map<number, any[]>): Promise<boolean> {
        try {
            // Convert Maps to objects for storage
            const discountsObj = Object.fromEntries(discounts);
            const taxesObj = Object.fromEntries(taxes);
            const couponsObj = Object.fromEntries(coupons);

            await Promise.all([
                cartStorage.setItem('matched-discounts-map', discountsObj),
                cartStorage.setItem('matched-taxes-map', taxesObj),
                cartStorage.setItem('matched-coupons-map', couponsObj)
            ]);
            return true;
        } catch (err) {
            if (err instanceof Error) {
                console.log(err);
                return false;
            }
            console.log("Unexpected Error Occurred while trying to save matched DTC Maps");
            return false;
        }
    },

    async getMatchedDTCMaps(): Promise<{
        discounts: Map<number, any[]>;
        taxes: Map<number, any[]>;
        coupons: Map<number, any[]>;
    }> {
        try {
            const [discountsObj, taxesObj, couponsObj] = await Promise.all([
                cartStorage.getItem<Record<number, any[]>>('matched-discounts-map'),
                cartStorage.getItem<Record<number, any[]>>('matched-taxes-map'),
                cartStorage.getItem<Record<number, any[]>>('matched-coupons-map')
            ]);

            // Convert objects back to Maps
            const discounts = new Map(Object.entries(discountsObj || {}).map(([key, value]) => [Number(key), value]));
            const taxes = new Map(Object.entries(taxesObj || {}).map(([key, value]) => [Number(key), value]));
            const coupons = new Map(Object.entries(couponsObj || {}).map(([key, value]) => [Number(key), value]));

            return { discounts, taxes, coupons };
        } catch (err) {
            if (err instanceof Error) {
                console.log(err);
            } else {
                console.log("Unexpected Error Occurred while trying to get matched DTC Maps");
            }
            return {
                discounts: new Map(),
                taxes: new Map(),
                coupons: new Map()
            };
        }
    },

    async clearMatchedDTCMaps(): Promise<boolean> {
        try {
            await Promise.all([
                cartStorage.removeItem('matched-discounts-map'),
                cartStorage.removeItem('matched-taxes-map'),
                cartStorage.removeItem('matched-coupons-map')
            ]);
            return true;
        } catch (err) {
            if (err instanceof Error) {
                console.log(err);
                return false;
            }
            console.log("Unexpected Error Occurred while trying to clear matched DTC Maps");
            return false;
        }
    },

    async saveCartDraft(draft: any): Promise<boolean> {
        try {
            const existing = await cartStorage.getItem<any[]>(STORAGE_KEYS.CART_DRAFTS);
            const drafts = Array.isArray(existing) ? existing : [];
            const prepared = {
                ...draft,
                matchedDiscounts: Object.fromEntries(draft.matchedDiscounts || []),
                matchedTaxes: Object.fromEntries(draft.matchedTaxes || []),
                matchedCoupons: Object.fromEntries(draft.matchedCoupons || [])
            };
            // Always create new entries instead of updating existing ones
            drafts.push(prepared);
            await cartStorage.setItem(STORAGE_KEYS.CART_DRAFTS, drafts);
            return true;
        } catch (err) {
            if (err instanceof Error) {
                console.log(err);
                return false;
            }
            console.log("Unexpected Error Occurred while trying to save cart draft");
            return false;
        }
    },

    async getCartDrafts(): Promise<any[]> {
        try {
            const drafts = await cartStorage.getItem<any[]>(STORAGE_KEYS.CART_DRAFTS);
            return drafts || [];
        } catch (err) {
            if (err instanceof Error) {
                console.log(err);
                return [];
            }
            console.log("Unexpected Error Occurred while trying to get cart drafts");
            return [];
        }
    },

    async loadCartDraft(draftId: string): Promise<any | null> {
        try {
            const drafts = await cartStorage.getItem<any[]>(STORAGE_KEYS.CART_DRAFTS);
            const found = (drafts || []).find(d => d.id === draftId);
            if (!found) return null;
            return {
                ...found,
                matchedDiscounts: new Map(Object.entries(found.matchedDiscounts || {}).map(([k, v]) => [Number(k), v])),
                matchedTaxes: new Map(Object.entries(found.matchedTaxes || {}).map(([k, v]) => [Number(k), v])),
                matchedCoupons: new Map(Object.entries(found.matchedCoupons || {}).map(([k, v]) => [Number(k), v]))
            };
        } catch (err) {
            if (err instanceof Error) {
                console.log(err);
                return null;
            }
            console.log("Unexpected Error Occurred while trying to load cart draft");
            return null;
        }
    },

    async deleteCartDraft(draftId: string): Promise<boolean> {
        try {
            const drafts = await cartStorage.getItem<any[]>(STORAGE_KEYS.CART_DRAFTS);
            const filtered = (drafts || []).filter(d => d.id !== draftId);
            await cartStorage.setItem(STORAGE_KEYS.CART_DRAFTS, filtered);
            return true;
        } catch (err) {
            if (err instanceof Error) {
                console.log(err);
                return false;
            }
            console.log("Unexpected Error Occurred while trying to delete cart draft");
            return false;
        }
    },

    handleDraftError(err: Error) {
        console.log(err);
    },

    async clearDraftData(): Promise<boolean> {
        try {
            const res = await cartStorage?.removeItem(STORAGE_KEYS?.CART_DRAFTS, this.handleDraftError);
            console.log(res);
            return true;
        }catch(err) {
            if (err instanceof Error) {
                console.log(err);
                return false;
            }
            console.log("Unexpected Error Occurred While Trying To Remove Draft Data");
            return false;
        }
    }
};

export const productCache = {
    async cacheProducts(products: any[], businessId: string) {
        try {
            const cacheKey = `${STORAGE_KEYS.PRODUCTS}_${businessId}`;
            await productStorage.setItem(cacheKey, {
                data: products,
                timestamp: Date.now(),
                businessId
            });
            return true;
        } catch (error) {
            console.error('Failed to cache products:', error);
            return false;
        }
    },

    async getCachedProducts(businessId: string): Promise<any[]> {
        try {
            const cacheKey = `${STORAGE_KEYS.PRODUCTS}_${businessId}`;
            const cached = await productStorage.getItem<{data: any[], timestamp: number}>(cacheKey);
            
            if (!cached) return [];
            
            // Check if cache is less than 24 hours old
            const isExpired = Date.now() - cached.timestamp > 24 * 60 * 60 * 1000;
            if (isExpired && isOnline()) {
                await productStorage.removeItem(cacheKey);
                return [];
            }
            
            return cached.data;
        } catch (error) {
            console.error('Failed to get cached products:', error);
            return [];
        }
    },

    async cacheVariants(variants: ProductVariantResponseObject[], businessId: string, productId?: string) {
        try {
            const cacheKey = productId 
                ? `${STORAGE_KEYS.VARIANTS}_${businessId}_${productId}`
                : `${STORAGE_KEYS.VARIANTS}_${businessId}_all`;
            
            await productStorage.setItem(cacheKey, {
                data: variants,
                timestamp: Date.now(),
                businessId,
                productId
            });
            return true;
        } catch (error) {
            console.error('Failed to cache variants:', error);
            return false;
        }
    },

    async getCachedVariants(businessId: string, productId?: string): Promise<ProductVariantResponseObject[]> {
        try {
            const cacheKey = productId 
                ? `${STORAGE_KEYS.VARIANTS}_${businessId}_${productId}`
                : `${STORAGE_KEYS.VARIANTS}_${businessId}_all`;
            
            const cached = await productStorage.getItem<{data: ProductVariantResponseObject[], timestamp: number}>(cacheKey);
            
            if (!cached) return [];
            
            // Check if cache is less than 1 hour old for variants (more frequent updates)
            const isExpired = Date.now() - cached.timestamp > 60 * 60 * 1000;
            if (isExpired && isOnline()) {
                await productStorage.removeItem(cacheKey);
                return [];
            }
            
            return cached.data;
        } catch (error) {
            console.error('Failed to get cached variants:', error);
            return [];
        }
    },

    async decrementVariantStock(businessId: string, variantId: number, decrementBy: number): Promise<boolean> {
        try {
            const keys = await productStorage.keys();
            const relevantKeys = keys.filter(k => k.startsWith(`${STORAGE_KEYS.VARIANTS}_${businessId}_`));
            
            let updated = false;
            for (const key of relevantKeys) {
                const cached = await productStorage.getItem<{data: ProductVariantResponseObject[], timestamp: number}>(key);
                if (cached && cached.data) {
                    let hasChanges = false;
                    const newData = cached.data.map(v => {
                        if (v.id === variantId) {
                            hasChanges = true;
                            return { ...v, quantity: Math.max(0, v.quantity - decrementBy) };
                        }
                        return v;
                    });
                    
                    if (hasChanges) {
                        await productStorage.setItem(key, { ...cached, data: newData });
                        updated = true;
                    }
                }
            }
            return updated;
        } catch (error) {
            console.error('Failed to decrement variant stock:', error);
            return false;
        }
    }
};

export const offlineOrders = {
    async addOfflineOrder(orderData: any) {
        try {
            const existingOrders = await this.getOfflineOrders();
            const newOrder = {
                ...orderData,
                id: `offline_${Date.now()}`,
                createdAt: new Date().toISOString(),
                status: 'pending_sync'
            };
            
            await orderStorage.setItem(STORAGE_KEYS.OFFLINE_ORDERS, [...existingOrders, newOrder]);
            toast.info('Order saved offline. Will sync when connection is restored.');
            return newOrder;
        } catch (error) {
            console.error('Failed to save offline order:', error);
            toast.error('Failed to save order offline');
            return null;
        }
    },

    async getOfflineOrders(): Promise<any[]> {
        try {
            const orders = await orderStorage.getItem<any[]>(STORAGE_KEYS.OFFLINE_ORDERS);
            return orders || [];
        } catch (error) {
            console.error('Failed to get offline orders:', error);
            return [];
        }
    },

    async removeOfflineOrder(orderId: string) {
        try {
            const orders = await this.getOfflineOrders();
            const updatedOrders = orders.filter(order => order.id !== orderId);
            await orderStorage.setItem(STORAGE_KEYS.OFFLINE_ORDERS, updatedOrders);
            return true;
        } catch (error) {
            console.error('Failed to remove offline order:', error);
            return false;
        }
    },

    async syncOfflineOrders(syncFunction: (orderData: any) => Promise<{ success: boolean; [key: string]: any } | boolean>) {
        try {
            const orders = await this.getOfflineOrders();
            if (orders.length === 0) return true;

            let syncedCount = 0;
            for (const order of orders) {
                try {
                    const result = await syncFunction(order);
                    const success = typeof result === 'boolean' ? result : result?.success === true;
                    if (success) {
                        await this.removeOfflineOrder(order.id);
                        syncedCount++;
                    }
                } catch (error) {
                    console.error('Failed to sync order:', order.id, error);
                }
            }

            if (syncedCount > 0) {
                toast.success(`Synced ${syncedCount} offline orders`);
            }

            return syncedCount === orders.length;
        } catch (error) {
            console.error('Failed to sync offline orders:', error);
            return false;
        }
    }
};

export const isOnline = () => {
    return typeof navigator !== 'undefined' && navigator.onLine;
};

export const networkUtils = {
    setupNetworkListeners(onOnline?: () => void, onOffline?: () => void) {
        if (typeof window === 'undefined') return;

        const handleOnline = () => {
            toast.success('Connection restored');
            onOnline?.();
        };

        const handleOffline = () => {
            toast.warning('You are now offline. Orders will be saved locally.');
            onOffline?.();
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }
};

export const discountCache = {
    async cacheDiscounts(discounts: any[], businessId: string) {
        try {
            const cacheKey = `${STORAGE_KEYS.DISCOUNTS}_${businessId}`;
            await discountStorage.setItem(cacheKey, {
                data: discounts,
                timestamp: Date.now(),
                businessId
            });
            return true;
        } catch (error) {
            console.error('Failed to cache discounts:', error);
            return false;
        }
    },

    async getCachedDiscounts(businessId: string): Promise<any[]> {
        try {
            const cacheKey = `${STORAGE_KEYS.DISCOUNTS}_${businessId}`;
            const cached = await discountStorage.getItem<{data: any[], timestamp: number}>(cacheKey);
            
            if (!cached) return [];
            
            const isExpired = Date.now() - cached.timestamp > 24 * 60 * 60 * 1000;
            if (isExpired && isOnline()) {
                await discountStorage.removeItem(cacheKey);
                return [];
            }
            
            return cached.data;
        } catch (error) {
            console.error('Failed to get cached discounts:', error);
            return [];
        }
    },

    async getDiscountsByProductId(businessId: string, productId: number): Promise<any[]> {
        try {
            const discounts = await this.getCachedDiscounts(businessId);
            // Filter discounts that contain the product_id
            return discounts.filter(discount => 
                discount.products && discount.products.some((p: any) => p.product_id === productId)
            );
        } catch (error) {
            console.error('Failed to get discounts by product ID:', error);
            return [];
        }
    }
};

export const taxCache = {
    async cacheTaxes(taxes: any[], businessId: string) {
        try {
            const cacheKey = `${STORAGE_KEYS.TAXES}_${businessId}`;
            await taxStorage.setItem(cacheKey, {
                data: taxes,
                timestamp: Date.now(),
                businessId
            });
            return true;
        } catch (error) {
            console.error('Failed to cache taxes:', error);
            return false;
        }
    },

    async getCachedTaxes(businessId: string): Promise<any[]> {
        try {
            const cacheKey = `${STORAGE_KEYS.TAXES}_${businessId}`;
            const cached = await taxStorage.getItem<{data: any[], timestamp: number}>(cacheKey);
            
            if (!cached) return [];
            
            // Check if cache is less than 24 hours old
            const isExpired = Date.now() - cached.timestamp > 24 * 60 * 60 * 1000;
            if (isExpired && isOnline()) {
                await taxStorage.removeItem(cacheKey);
                return [];
            }
            
            return cached.data;
        } catch (error) {
            console.error('Failed to get cached taxes:', error);
            return [];
        }
    },

    async getTaxesByProductId(businessId: string, productId: number): Promise<any[]> {
        try {
            const taxes = await this.getCachedTaxes(businessId);
            // Filter taxes that contain the product_id
            return taxes.filter(tax => 
                tax.products && tax.products.some((p: any) => p.product_id === productId)
            );
        } catch (error) {
            console.error('Failed to get taxes by product ID:', error);
            return [];
        }
    }
};

export const couponCache = {
    async cacheCoupons(coupons: any[], businessId: string) {
        try {
            const cacheKey = `${STORAGE_KEYS.COUPONS}_${businessId}`;
            await couponStorage.setItem(cacheKey, {
                data: coupons,
                timestamp: Date.now(),
                businessId
            });
            return true;
        } catch (error) {
            console.error('Failed to cache coupons:', error);
            return false;
        }
    },

    async getCachedCoupons(businessId: string): Promise<any[]> {
        try {
            const cacheKey = `${STORAGE_KEYS.COUPONS}_${businessId}`;
            const cached = await couponStorage.getItem<{data: any[], timestamp: number}>(cacheKey);
            
            if (!cached) return [];
            
            // Check if cache is less than 24 hours old
            const isExpired = Date.now() - cached.timestamp > 24 * 60 * 60 * 1000;
            if (isExpired && isOnline()) {
                await couponStorage.removeItem(cacheKey);
                return [];
            }
            
            return cached.data;
        } catch (error) {
            console.error('Failed to get cached coupons:', error);
            return [];
        }
    },

    async getCouponsByProductId(businessId: string, productId: number): Promise<any[]> {
        try {
            const coupons = await this.getCachedCoupons(businessId);
            // Filter coupons that contain the product_id
            return coupons.filter(coupon => 
                coupon.products && coupon.products.some((p: any) => p.product_id === productId)
            );
        } catch (error) {
            console.error('Failed to get coupons by product ID:', error);
            return [];
        }
    }
};

export type SalesReportQueryLogic = {
    business_id: number;
    generated_at: string;
    mapId: string;
    date_range?: string;
    report_type: string;
    start_date?: string;
    end_date?: string;
    format: string;
    query_data: Map<string, string>;
}


export const salesReportUtils = {
	async setSalesReportQuery(businessId: number, data: SalesReportQueryLogic[]): Promise<boolean> {
		if (!Array.isArray(data) || data.length === 0) return false;

		try {
			const key = `${STORAGE_KEYS?.SALE_REPORTS}_${businessId}`;
			const previousData = (await this.getSalesReportQuery(businessId)) || [];

			// Build a map for quick upsert by mapId
			const byId = new Map<string, SalesReportQueryLogic>();
			for (const item of previousData) {
				if (item?.mapId) {
					byId.set(item.mapId, item);
				}
			}

			for (const newItem of data) {
				if (!newItem?.mapId) {
					console.warn('Skipping sales report without mapId');
					continue;
				}
				const existing = byId.get(newItem.mapId);
				if (existing) {
					byId.set(newItem.mapId, {
						...existing,
						...newItem,
					});
				} else {
					byId.set(newItem.mapId, { ...newItem });
				}
			}

			const merged = Array.from(byId.values());

			if (salesReportStorage) {
				await salesReportStorage.setItem(key, merged);
				return true;
			}

			throw new Error('Storage not initialized');
		} catch (error) {
			console.error('Failed to update sales report query:', error);
			return false;
		}
	},
    async getSalesReportQuery(businessId: number) {
        try {
            const data = await salesReportStorage?.getItem(`${STORAGE_KEYS?.SALE_REPORTS}_${businessId}`) as SalesReportQueryLogic[];
            return data;
        }catch(err) {
            console.log(err);
            return null;
        }
    },
    async clearSalesReportQuery(business_id: number) {
        try {
            await salesReportStorage?.removeItem(`${STORAGE_KEYS?.SALE_REPORTS}_${business_id}`);
            return true;
        }catch(err) {
            console.log(err);
            return false;
        }
    },
    async removeSalesReportItem(mapId: string, business_id: number) {
        if (!mapId && !business_id) return;
        try {
            const data = await salesReportStorage?.getItem(`${STORAGE_KEYS?.SALE_REPORTS}_${business_id}`) as SalesReportQueryLogic[];
            if (data?.length <= 0) return [];
            const filteredData = data?.filter(item => !Object.is(item?.mapId, mapId));
            await salesReportStorage?.setItem(`${STORAGE_KEYS?.SALE_REPORTS}_${business_id}`, filteredData);
            return true;   
        }catch(err) {
            console.log("Error Occurred While Trying To Remove Sales Report Item", err);
            return false;
        }
    }
}

export const offlineCustomerUtils = {
    addCustomer: async (data: CustomerResponse[], business_id: number) => {
        try {
            await offlineCustomers.setItem(`${STORAGE_KEYS?.OFFLINE_CUSTOMERS}_${business_id}`, data);
            return true;
        }catch(err) {
            console.log(err);
            return false;
        }
    },
    getCustomers: async (business_id: number) => {
        try {
            const resp = await offlineCustomers.getItem(`${STORAGE_KEYS?.OFFLINE_CUSTOMERS}_${business_id}`);
            return resp;
        }catch(err) {
            console.log(err);
            return false;
        } 
    },
    clearCustomers: async () => {
        try {
            await offlineCustomers.clear();
            return true;
        }catch(err) {
            if (err instanceof Error) {
                console.log(err?.message);
                return false;
            }
            return false;
        }
    }
}