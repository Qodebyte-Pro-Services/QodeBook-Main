"use client"

import { BsFillPencilFill } from "react-icons/bs";
import { SimpleCard } from "../..";
import { TbCurrencyNaira } from "react-icons/tb";
import { PiShoppingCartSimple, PiWarning } from "react-icons/pi";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { MdOutlineStackedBarChart } from "react-icons/md";
import Link from "next/link";
import { useCustomStyles } from "@/hooks";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CheckCircle, LoaderPinwheel } from "lucide-react";
import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getProductsById, getSuppliersByBusinessId, getVariantsByProductId, getProductCategories, getProductVariantStocks, getProductStocksMovement, getTotalProductsRevenue } from "@/api/controllers/get/handler";
import { ProductVariantResponseObject, SingleProductType, SupplierDataResponse, CategoriesResponseType, ProductVariantStockMovement, StockMovementLogs } from "@/models/types/shared/handlers-type";
import { SuppliersForm } from "../sketch";
import { startTransition } from "react";
import productVariantsColumn from "@/components/data-table/product-variants-column";
import { AnimatePresence, motion } from "framer-motion";
import { RiLoader4Line } from "react-icons/ri";
import { X, AlertCircle, Save } from "lucide-react";
import { EditProductVariation } from "../forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStockMovementData, useToggleActions } from "@/store/selected-row-store";
import { toast } from "sonner";
import { useEditProductByIdHandler } from "@/hooks/useControllers";
import { ChartFlow } from "../../charts";
import { stockColumn } from "@/components/data-table/stock-columns";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { RxCaretLeft, RxCaretRight, RxShare2 } from "react-icons/rx";
import { FaRegEdit } from "react-icons/fa";
import { ProductAreaChart } from "../../charts/product-area-chart";
import CreateOrderForm from "../sketch/create-order-form";
import Image from "next/image";

type ProductCardDataType = {
    id: string;
    name: string;
    amount: number;
    isCurrency: boolean;
    quantity: number;
};

const ProductView = ({ id }: { id: string }) => {
    const [tabs] = useState<Array<string>>(["Description", "Movement History", "Supplier Details", "Variants", "Graph"]);
    const [tabFloatStyle, setTabFloatStyle] = useState<{ x: number; width: number }>({
        x: 0,
        width: 0
    });
    const [activeTab, setActiveTab] = useState<number>(0);
    const [inventoryUnits, setInventoryUnits] = useState<number>(0);
    const [productsById, setProductsById] = useState<SingleProductType>({
        id: 0,
        business_id: 0,
        category_id: 0,
        name: "",
        brand: "",
        description: "",
        base_sku: "",
        image_url: [],
        taxable: false,
        threshold: 0,
        created_at: "",
        updated_at: "",
        unit: "",
        hasVariation: false,
        category_name: ""
    });
    const [isShow, setIsShow] = useState<boolean>(false);
    const [showEditForm, setShowEditForm] = useState<boolean>(false);
    const [categories, setCategories] = useState<CategoriesResponseType['categories']>([]);
    const [editFormData, setEditFormData] = useState({
        name: "",
        brand: "",
        description: "",
        category_id: 0,
        taxable: false,
        threshold: 0,
        unit: "",
        hasVariation: false
    });
    const [editFormErrors, setEditFormErrors] = useState<{ [key: string]: string }>({});
    const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);
    const [editFormImages, setEditFormImages] = useState<Array<{ secure_url: string; public_id: string }>>([]);
    const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

    const uniqueId = useId();

    const { hiddenScrollbar } = useCustomStyles();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

    const [variants, setVariants] = useState<ProductVariantResponseObject[]>([]);
    const [inventoryValueData, setInventoryValueData] = useState<ProductCardDataType[]>([]);
    const [totalInStockData, setTotalInStockData] = useState<ProductCardDataType[]>([]);
    const [variantLevelData, setVariantLevelData] = useState<ProductCardDataType[]>([]);
    const [potentialSalesValue, setPotentialSalesValue] = useState<ProductCardDataType[]>([]);
    const [vImages, setVImages] = useState<Array<{ secure_url: string; public_id: string }>>([]);
    const [vImageIndex, setVImagesIndex] = useState<number>(0);
    const [pSuppliers, setpSuppliers] = useState<SupplierDataResponse[]>();

    const [showEditFormVariant, setShowEditFormVariant] = useState<boolean>(false);
    const [showReorderForm, setShowReorderForm] = useState<boolean>(false);
    const [chartData, setChartData] = useState<ProductVariantStockMovement>({
        product_id: 0,
        variants: []
    });

    const [replaceImages, setReplaceImages] = useState<Array<{ secure_url: string; public_id: string }>>([]);
    const [newImages, setNewImages] = useState<Array<File | FileList>>([]);

    const businessId = useMemo(() => {
        if (typeof window !== "undefined") {
            const storedBusinessId = sessionStorage.getItem("selectedBusinessId");
            return storedBusinessId ? JSON.parse(storedBusinessId) : 0;
        }
        return 0;
    }, []);

    const { toggleState, clearToggleState } = useToggleActions();
    const { stockMovements, setStockMovements } = useStockMovementData();

    const [restockedQuantity, setRestockedQuantity] = useState<number>(0);
    const [leastThreshold, setLeastThresHold] = useState<number>(0);

    const { data, isError, error, isLoading, isSuccess } = useQuery({
        queryKey: ["getProductsById", id],
        queryFn: () => getProductsById({ productId: id, businessId: businessId }),
        enabled: Boolean(id),
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        retry: 1,
        staleTime: 5 * 60 * 1000,
    });

    const { data: variantsData, isError: variantsIsError, isSuccess: variantsIsSuccess } = useQuery({
        queryKey: ["productVariants", businessId],
        queryFn: () => getVariantsByProductId({ productId: id, businessId: businessId }),
        enabled: Boolean(id),
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        retry: 2,
    });

    const { data: suppliersData, isError: suppliersIsError, isSuccess: suppliersIsSuccess } = useQuery({
        queryKey: ["getSupplierById", businessId],
        queryFn: () => getSuppliersByBusinessId(businessId),
        enabled: Boolean(businessId),
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        retry: 2,
    });

    const { data: categoriesData, isSuccess: categoriesIsSuccess } = useQuery({
        queryKey: ["getProductCategories", businessId],
        queryFn: () => getProductCategories(businessId),
        enabled: Boolean(businessId),
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        retry: 2,
    });

    const { data: stockChartData, isSuccess: isStockChartSuccess } = useQuery({
        queryKey: ["product-variant-stock-movement", businessId, id],
        queryFn: () => getProductVariantStocks({ businessId: businessId, productId: +id }),
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        enabled: businessId !== 0 && id !== "",
        retry: false
    });

    const { data: totalProductRevenue, isSuccess: productRevenueSuccess, isError: productRevenueError } = useQuery({
        queryKey: ["get-prodyuct-total-revenue", businessId],
        queryFn: () => getTotalProductsRevenue({ url: `/api/finance/product-revenue-analytics?business_id=${businessId}&product_id=${id}`, businessId }),
        enabled: businessId !== 0 && id !== "",
        refetchOnWindowFocus: 'always',
        retry: false
    });

    const product_id = useMemo(() => {
        return Number(id);
    }, [id]);

    const { data: stocksMovement, error: stockError, isSuccess: stockSuccess } = useQuery({
        queryKey: ['stock-movement', businessId, product_id],
        queryFn: () => getProductStocksMovement({ business_id: businessId, product_id: product_id }),
        enabled: businessId !== 0 && product_id !== 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        retry: 2
    });

    useEffect(() => {
        startTransition(async () => {
            await new Promise(res => setTimeout(res, 300));
            if (stocksMovement?.logs) {
                setStockMovements(stocksMovement?.logs || []);
                const restokedItems = stocksMovement?.logs?.filter((item: StockMovementLogs) => item.type !== "adjustment");
                const restockedQuantity = restokedItems?.reduce((total: number, item: StockMovementLogs) => total + item.quantity, 0);
                setRestockedQuantity(restockedQuantity);
            }
        })
    }, [stocksMovement, stockSuccess, stockError, setStockMovements])


    useEffect(() => {
        startTransition(async () => {
            await new Promise(res => setTimeout(res, 300));
            if (isStockChartSuccess && stockChartData?.variants && stockChartData?.product_id) {
                setChartData(stockChartData);
            }
        })
    }, [stockChartData, isStockChartSuccess]);

    const editProductFormHandler = useEditProductByIdHandler();

    const inventoryvaluedata = useMemo(() => {
        if (variants) {
            const totalInventoryValue = variants?.reduce((total, variant) => {
                return total += +variant.cost_price * variant.quantity;
            }, 0);
            return [
                {
                    id: `${uniqueId}-inventory-value`,
                    name: "Inventory Value",
                    amount: totalInventoryValue,
                    isCurrency: true,
                    quantity: totalInventoryValue * 0.01 || 1
                }
            ];
        } else {
            return [
                {
                    id: '0-inventory-value',
                    name: "Inventory Value",
                    amount: 0,
                    isCurrency: true,
                    quantity: 0
                }
            ];
        }
    }, [variants, uniqueId]);

    const totalBaseCost = useMemo(() => {
        const leastThreshold = Math.min.apply(null, variants?.map(item => item.threshold));
        setLeastThresHold(leastThreshold);
        return variants?.reduce((prev, item) => prev += +item?.selling_price, 0);
    }, [variants]);

    const totalCostPrice = useMemo(() => {
        return variants?.reduce((prev, item) => prev += +item?.cost_price, 0);
    }, [variants]);

    const totalValueInstock = useMemo(() => {
        if (variants) {
            const totalInStockItem = variants?.reduce((prev, variant) => +variant?.quantity + prev, 0);
            setInventoryUnits(totalInStockItem);
            return [
                {
                    id: `${uniqueId}-total-inventory`,
                    name: "Total Inventory Units",
                    amount: totalInStockItem,
                    isCurrency: false,
                    quantity: 0
                }
            ];
        } else {
            return [
                {
                    id: '0-total-instock',
                    name: "Total Inventory Units",
                    amount: 0,
                    isCurrency: false,
                    quantity: 0
                }
            ];
        }
    }, [variants, uniqueId]);

    const variantCount = useMemo(() => {
        if (variants) {
            const totalVariant = variants?.length;
            return [
                {
                    id: `${uniqueId}-variant-level`,
                    name: "Variant Count",
                    amount: totalVariant,
                    isCurrency: false,
                    quantity: 0
                }
            ]
        } else {
            return [
                {
                    id: '0-variant-level',
                    name: "Variant Count",
                    amount: 0,
                    isCurrency: false,
                    quantity: 0
                }
            ]
        }
    }, [variants, uniqueId]);

    const potentialsalevalue = useMemo(() => {
        if (variants) {
            const potentialSaleValue = variants?.reduce((total, variant) => total += (+variant?.selling_price * variant?.quantity), 0);
            return [
                {
                    id: `${uniqueId}-potential-sale-value`,
                    name: "Potential Sale Value",
                    amount: potentialSaleValue,
                    isCurrency: true,
                    quantity: potentialSaleValue * 0.01 || 0
                }
            ];
        } else {
            return [
                {
                    id: '0-potential-sale-value',
                    name: "Potential Sale Value",
                    amount: 0,
                    isCurrency: true,
                    quantity: 0
                }
            ];
        }
    }, [variants, uniqueId]);

    const grossIncomeData = useMemo(() => {
        if (productRevenueSuccess && !productRevenueError) {
            console.log(totalProductRevenue);
            return [
                {
                    id: `${2}-total-revenue`,
                    name: "Total Revenue",
                    amount: totalProductRevenue?.totalRevenue || 0,
                    isCurrency: true,
                    quantity: totalProductRevenue?.totalRevenue * 0.01 || 0
                }
            ];
        } else {
            return [
                {
                    id: '0-total-revenue',
                    name: "Total Revenue",
                    amount: 0,
                    isCurrency: true,
                    quantity: 0
                }
            ];
        }
    }, [totalProductRevenue, productRevenueSuccess, productRevenueError]);

    const variantImages = useMemo(() => {
        const variant_images = variants?.flatMap(item => item.image_url);
        return variant_images?.concat(productsById?.image_url || []).reverse();
    }, [variants, productsById]);

    useEffect(() => {
        if (variantImages) {
            console.log(variantImages);
            startTransition(async () => {
                await new Promise(res => setTimeout(res, 100));
                setVImages(variantImages);
            })
        }
    }, [variantImages])

    useEffect(() => {
        startTransition(async () => {
            await new Promise(res => setTimeout(res, 100));
            setInventoryValueData(inventoryvaluedata);
        });
        return () => setInventoryValueData([]);
    }, [inventoryvaluedata]);

    useEffect(() => {
        startTransition(async () => {
            await new Promise(res => setTimeout(res, 100));
            setTotalInStockData(totalValueInstock);
        });
        return () => setTotalInStockData([]);
    }, [totalValueInstock]);

    useEffect(() => {
        startTransition(async () => {
            await new Promise(res => setTimeout(res, 100));
            setVariantLevelData(variantCount);
        });
        return () => setVariantLevelData([]);
    }, [variantCount]);

    useEffect(() => {
        startTransition(async () => {
            await new Promise(res => setTimeout(res, 100));
            setPotentialSalesValue(potentialsalevalue);
        })
    }, [potentialsalevalue])

    useEffect(() => {
        startTransition(async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
            if (!variantsIsError && variantsIsSuccess) {
                setVariants(variantsData?.variants);
            }
        });
        return () => {
            setVariants([]);
        }

    }, [variantsData, variantsIsError, variantsIsSuccess]);

    useEffect(() => {
        startTransition(async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            if (!suppliersIsError && suppliersIsSuccess) {
                setpSuppliers(suppliersData?.suppliers);
            }
        });
        return () => setpSuppliers([]);
    }, [suppliersData, suppliersIsError, suppliersIsSuccess]);

    useEffect(() => {
        if (categoriesData?.categories && categoriesIsSuccess) {
            setCategories(categoriesData.categories);
        }
    }, [categoriesData, categoriesIsSuccess]);

    useEffect(() => {
        if (productsById && showEditForm) {
            setEditFormData({
                name: productsById.name || "",
                brand: productsById.brand || "",
                description: productsById.description || "",
                category_id: productsById.category_id || 0,
                taxable: productsById.taxable || false,
                threshold: productsById.threshold || 0,
                unit: productsById.unit || "",
                hasVariation: productsById.hasVariation || false
            });
            setEditFormImages(productsById?.image_url || []);
        }
    }, [productsById, showEditForm]);

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setEditFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked :
                (name === 'category_id' || name === 'threshold') ? Number(value) : value
        }));

        if (editFormErrors[name]) {
            setEditFormErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleCategoryChange = (value: string) => {
        setEditFormData(prev => ({
            ...prev,
            category_id: Number(value)
        }));

        if (editFormErrors.category_id) {
            setEditFormErrors(prev => ({
                ...prev,
                category_id: ""
            }));
        }
    };

    const handleEditFormSubmit = async () => {
        const errors: { [key: string]: string } = {};

        const replace_images_id = replaceImages.map((data) => data.public_id);
        const unique_replace_ids = [...new Set(replace_images_id)];

        if (!editFormData.name.trim()) errors.name = "Product name is required";
        if (!editFormData.brand.trim()) errors.brand = "Brand is required";
        if (!editFormData.description.trim()) errors.description = "Description is required";
        if (editFormData.description.length < 10) errors.description = "Description must be at least 10 characters";
        if (!editFormData.category_id || editFormData.category_id === 0) errors.category_id = "Category is required";
        if (!editFormData.unit.trim()) errors.unit = "Unit is required";

        if (Object.keys(errors).length > 0) {
            setEditFormErrors(errors);
            return;
        }

        setIsSubmittingEdit(true);
        try {
            const formData = new FormData();

            formData.append('name', editFormData.name);
            formData.append('brand', editFormData.brand);
            formData.append('description', editFormData.description);
            formData.append('category_id', editFormData.category_id.toString());
            formData.append('unit', editFormData.unit);
            formData.append('threshold', editFormData.threshold.toString());
            formData.append('taxable', editFormData.taxable.toString());
            formData.append('hasVariation', editFormData.hasVariation.toString());

            if (editFormImages && editFormImages.length > 0) {
                newImages.forEach((_file, idx) => {
                    formData.append(`image_url[${idx}]`, _file as File);
                });
            }

            if (unique_replace_ids && unique_replace_ids.filter(Boolean).length) {
                const ids = unique_replace_ids.filter(Boolean);
                formData.append('remove_images', JSON.stringify(ids));
            }

            try {
                const resData = await editProductFormHandler.mutateAsync({
                    data: formData,
                    productId: productsById.id,
                    businessId: businessId
                });
                toast.success(resData?.message ?? "Product updated successfully");
                setShowEditForm(false);
            } catch (err) {
                if (err instanceof Error) {
                    toast.error(err?.message ?? "Failed To Updated Product");
                    return;
                }
                toast.error("Unexpected Error Occurred While Trying To Edit Product");
            }
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error("Failed to update product");
        } finally {
            setIsSubmittingEdit(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        setIsUploadingImage(true);
        try {
            const uploadedUrls: string[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setNewImages(prev => ([...prev, file]));
                const tempUrl = URL.createObjectURL(file);
                uploadedUrls.push(tempUrl);
            }

            setEditFormImages(prev => [...prev, ...uploadedUrls.map(url => ({ secure_url: url, public_id: "" }))]);
        } catch (error) {
            console.error('Error uploading images:', error);
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleDeleteImage = (index: number) => {
        setEditFormImages(prev => {
            setReplaceImages(_ => ([..._, (prev.find((_, i) => i === index) as { secure_url: string; public_id: string; })]));
            return prev.filter((_, i) => i !== index)
        });
    };

    const handleReplaceImage = async (index: number) => {
        const input = document.createElement("input") as HTMLInputElement;
        input.type = "file";
        input.accept = "image/png, image/jpg, image/jpeg, image/gif, image/webp";

        input.onchange = (event: Event) => {
            const target = event.target as HTMLInputElement;
            if (target.files && target.files[0]) {
                const url = URL.createObjectURL(target.files[0]);
                setEditFormImages(prev =>
                    prev?.map((img, idx) => idx === index ? { secure_url: url, public_id: "" } : img) || []
                );
            }
        };

        input.click();
    };

    const handleImageUploadClick = () => {
        const input = (document.createElement('input') as HTMLInputElement);
        input.type = 'file';
        input.accept = 'image/png, image/jpg, image/jpeg, image/gif, image/webp';
        input.multiple = true;
        input.onchange = (event: Event) => {
            const target = event.target as HTMLInputElement;
            if (target.files) {
                handleImageUpload({
                    target,
                    nativeEvent: event,
                    isDefaultPrevented: () => false,
                    isPropagationStopped: () => false,
                    persist: () => { },
                    preventDefault: () => event.preventDefault(),
                    stopPropagation: () => event.stopPropagation(),
                    type: 'change',
                    bubbles: true,
                    cancelable: true,
                    currentTarget: target,
                    eventPhase: 2,
                } as React.ChangeEvent<HTMLInputElement>);
            }
        };
        input.click();
    };

    useEffect(() => {
        const nodeElem = nodeRefs.current[activeTab] as HTMLDivElement;
        const containerElem = containerRef.current!;
        const padding = 18;
        const nodeElemX = nodeElem?.getBoundingClientRect().left || 0;
        const containerX = containerElem?.getBoundingClientRect().left || 0;
        const containerScrollLeft = containerElem?.scrollLeft || 0;
        setTabFloatStyle({
            x: nodeElemX - containerX + containerScrollLeft - (padding / 2),
            width: nodeElem?.getBoundingClientRect().width + padding || 0
        })
    }, [activeTab]);

    useEffect(() => {
        if (isSuccess) {
            setProductsById(data?.product);
        }
        if (isError) {
            console.error("Error fetching product:", error);
        }
    }, [data, isSuccess, isError, error]);

    const handleShare = async (e: React.MouseEvent<HTMLDivElement>) => {
        const dataUrl = e.currentTarget.dataset.url;
        if (navigator.share) {
            await navigator.share({
                title: productsById?.name,
                text: productsById?.description,
                url: dataUrl
            });
        } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(`${dataUrl}`);
            toast.success(`${productsById?.name} Detail Link Copied`);
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = `${dataUrl}`;
            textArea.select();
            document.body.appendChild(textArea);
            document.execCommand("copy");
            toast.success(`${productsById?.name} Detail Link Copied`);
            document.body.removeChild(textArea);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <LoaderPinwheel size={20} className="animate-spin text-template-primary" />
                <span className="ml-2">Loading product...</span>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-red-500">
                    Error loading product: {error?.message || "Unknown error"}
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                <div className="text-base font-[600]">Inventory</div>
                <button
                    onClick={() => setShowEditForm(true)}
                    className="py-2 px-4 rounded-md font-[550] self-start text-slate-100 bg-template-primary text-sm cursor-pointer flex items-center gap-x-3"
                >
                    <BsFillPencilFill size={15} />
                    <span>Edit Product</span>
                </button>
            </div>

            {/* Product Form For HERE */}
            <AnimatePresence mode="wait">
                {showEditForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 }}
                            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] overflow-y-auto"
                        >
                            <div className="bg-gradient-to-r from-template-chart-store to-template-primary p-6 text-white">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-xl">
                                            <BsFillPencilFill size={24} />
                                        </div>
                                        <h2 className="text-xl font-bold">Edit Product</h2>
                                    </div>
                                    <button
                                        onClick={() => setShowEditForm(false)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <p className="text-white/80 text-sm">
                                    Update product information and settings
                                </p>
                            </div>

                            <div className="p-6">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label htmlFor="edit-name" className="text-sm font-semibold text-gray-700">
                                            Product Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="edit-name"
                                            name="name"
                                            value={editFormData.name}
                                            onChange={handleEditFormChange}
                                            placeholder="Enter product name"
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${editFormErrors.name
                                                ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                                                : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                                }`}
                                        />
                                        {editFormErrors.name && (
                                            <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                <AlertCircle size={14} />
                                                <span>{editFormErrors.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="edit-brand" className="text-sm font-semibold text-gray-700">
                                            Brand *
                                        </label>
                                        <input
                                            type="text"
                                            id="edit-brand"
                                            name="brand"
                                            value={editFormData.brand}
                                            onChange={handleEditFormChange}
                                            placeholder="Enter brand name"
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${editFormErrors.brand
                                                ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                                                : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                                }`}
                                        />
                                        {editFormErrors.brand && (
                                            <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                <AlertCircle size={14} />
                                                <span>{editFormErrors.brand}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="edit-category" className="text-sm font-semibold text-gray-700">
                                            Category *
                                        </label>
                                        <Select value={editFormData.category_id.toString()} onValueChange={handleCategoryChange}>
                                            <SelectTrigger className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${editFormErrors.category_id
                                                ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                                                : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                                }`}>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">Select a category</SelectItem>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {editFormErrors.category_id && (
                                            <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                <AlertCircle size={14} />
                                                <span>{editFormErrors.category_id}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="edit-description" className="text-sm font-semibold text-gray-700">
                                            Description *
                                        </label>
                                        <textarea
                                            id="edit-description"
                                            name="description"
                                            rows={4}
                                            value={editFormData.description}
                                            onChange={handleEditFormChange}
                                            placeholder="Describe this product (minimum 10 characters)"
                                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${editFormErrors.description
                                                ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                                                : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                                }`}
                                        />
                                        {editFormErrors.description && (
                                            <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                <AlertCircle size={14} />
                                                <span>{editFormErrors.description}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="edit-unit" className="text-sm font-semibold text-gray-700">
                                                Unit *
                                            </label>
                                            <input
                                                type="text"
                                                id="edit-unit"
                                                name="unit"
                                                value={editFormData.unit}
                                                onChange={handleEditFormChange}
                                                placeholder="e.g., kg, pieces, liters"
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${editFormErrors.unit
                                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                                    }`}
                                            />
                                            {editFormErrors.unit && (
                                                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                    <AlertCircle size={14} />
                                                    <span>{editFormErrors.unit}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="edit-threshold" className="text-sm font-semibold text-gray-700">
                                                Threshold Level
                                            </label>
                                            <input
                                                type="number"
                                                id="edit-threshold"
                                                name="threshold"
                                                min="0"
                                                value={editFormData.threshold}
                                                onChange={handleEditFormChange}
                                                placeholder="0"
                                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${editFormErrors.threshold
                                                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-template-chart-store/20 focus:border-template-chart-store'
                                                    }`}
                                            />
                                            {editFormErrors.threshold && (
                                                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                                                    <AlertCircle size={14} />
                                                    <span>{editFormErrors.threshold}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id="edit-taxable"
                                                name="taxable"
                                                checked={editFormData.taxable}
                                                onChange={handleEditFormChange}
                                                className="w-4 h-4 text-template-chart-store bg-gray-100 border-gray-300 rounded focus:ring-template-chart-store focus:ring-2"
                                            />
                                            <label htmlFor="edit-taxable" className="text-sm font-medium text-gray-700">
                                                Taxable product
                                            </label>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id="edit-hasVariation"
                                                name="hasVariation"
                                                checked={editFormData.hasVariation}
                                                onChange={handleEditFormChange}
                                                className="w-4 h-4 text-template-chart-store bg-gray-100 border-gray-300 rounded focus:ring-template-chart-store focus:ring-2"
                                            />
                                            <label htmlFor="edit-hasVariation" className="text-sm font-medium text-gray-700">
                                                Product has variations
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-semibold text-gray-700">
                                                Product Images
                                            </label>
                                            <button
                                                type="button"
                                                className="text-sm text-template-chart-store hover:text-template-chart-store/80 font-medium"
                                                onClick={handleImageUploadClick}
                                            >
                                                Add New Image
                                            </button>
                                        </div>

                                        {editFormImages.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {editFormImages.map((imageUrl, index) => (
                                                    <div key={`product-image-${index}`} className="relative group">
                                                        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                                            <Image
                                                                width={400}
                                                                height={400}
                                                                src={`${imageUrl?.secure_url || '/images/pre-image-view.png'}`}
                                                                alt={`Product ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
                                                                    title="Replace image"
                                                                    onClick={() => handleReplaceImage(index)}
                                                                >
                                                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50 transition-colors"
                                                                    title="Delete image"
                                                                    onClick={() => handleDeleteImage(index)}
                                                                >
                                                                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-3 bg-gray-100 rounded-full">
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">No product images</p>
                                                        <p className="text-xs text-gray-500 mt-1">Upload images to showcase your product</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="px-4 py-2 bg-template-chart-store text-white text-sm rounded-lg hover:bg-template-chart-store/90 transition-colors"
                                                        onClick={handleImageUploadClick}
                                                    >
                                                        Upload Images
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 border-t border-gray-100 p-6">
                                <div className="flex flex-col md:flex-row gap-3">
                                    <button
                                        onClick={() => setShowEditForm(false)}
                                        className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleEditFormSubmit}
                                        disabled={isSubmittingEdit || isUploadingImage}
                                        className="flex-1 py-3 px-4 bg-template-chart-store text-white rounded-xl font-medium hover:bg-template-chart-store/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmittingEdit ? (
                                            <>
                                                <RiLoader4Line className="animate-spin" size={16} />
                                                <span>Updating...</span>
                                            </>
                                        ) : isUploadingImage ? (
                                            <>
                                                <RiLoader4Line className="animate-spin" size={16} />
                                                <span>Uploading images...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                <span>Update Product</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem className="">
                        <BreadcrumbLink asChild>
                            <Link href="/">Overview</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem className="">
                        <BreadcrumbLink asChild>
                            <Link href="/inventory">Inventory</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem className="">
                        <BreadcrumbPage>
                            View Product
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem className="">
                        <BreadcrumbPage>{productsById?.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <SimpleCard data={inventoryValueData[0]} icon={TbCurrencyNaira} />
                <SimpleCard data={potentialSalesValue[0]} icon={MdOutlineStackedBarChart} />
                <SimpleCard data={totalInStockData[0]} icon={PiShoppingCartSimple} />
                <SimpleCard data={variantLevelData[0]} icon={LuChartNoAxesCombined} />
                <SimpleCard data={grossIncomeData[0]} icon={TbCurrencyNaira} />
            </div>
            <div className="flex flex-col gap-y-3">
                <div className="w-full relative z-10 rounded-md overflow-x-auto bg-template-whitesmoke-dim px-3 py-1" ref={containerRef} style={hiddenScrollbar}>
                    <div className="min-w-[570px] w-full">
                        <div className="flex items-center gap-x-4 sm:justify-between">
                            {tabs?.map((tab, index) => (
                                <div ref={el => {
                                    if (el) nodeRefs.current[index] = el;
                                }} key={index} onClick={() => setActiveTab(index)} className="text-sm font-[500] cursor-pointer whitespace-nowrap">{tab}</div>
                            ))}
                        </div>
                    </div>
                    <div className="absolute transition-all duration-300 ease-linear top-1/2 -translate-y-1/2 left-1 bg-white w-[20%] h-[80%] -z-10 rounded-md" style={{
                        left: tabFloatStyle.x,
                        width: tabFloatStyle.width
                    }} />
                </div>
                {activeTab === 0 ? (
                    <div className="flex flex-col gap-y-2">
                        <div className="flex md:px-2 flex-col flex-wrap shrink min-[630px]:flex-nowrap gap-y-8">
                            <div className="w-full grid grid-cols-1 md:grid-cols-[45%_55%] gap-10">
                                <div className="w-full flex flex-col gap-y-2">
                                    <div className="grid grid-cols-[85%_15%] min-[530px]:grid-cols-[90%_10%] gap-2 min-[530px]:gap-4">
                                        <div className="w-full h-[300px] min-[520px]:h-[380px] rounded-md bg-white overflow-hidden group">
                                            <Image width={350} height={350} className="w-full h-full object-contain object-center aspect-square hover:scale-110 transition-all duration-500 ease-in-out group-hover:scale-110 group-active:scale-110 group-active:duration-250 group-active:touch-manipulation" src={`${vImages?.[vImageIndex]?.secure_url || '/images/pre-image-view.png'}`} alt={`product-main-${vImages?.[vImageIndex]?.public_id}`} />
                                        </div>
                                        <div className="h-auto flex flex-col justify-between">
                                            <div className="flex flex-col gap-y-3">
                                                <div data-url={`${location.href}`} onClick={handleShare} className="w-10 h-10 min-[530px]:w-8 min-[530px]:h-8 rounded-md bg-white flex justify-center items-center">
                                                    <RxShare2 size={18} />
                                                </div>
                                                <div onClick={() => setShowEditForm(true)} className="w-10 h-10 min-[530px]:w-8 min-[530px]:h-8 rounded-md bg-white flex justify-center items-center">
                                                    <FaRegEdit size={17} />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-y-3">
                                                <div onClick={() => setVImagesIndex(prev => Math.max(0, prev - 1))} className="w-10 h-10 min-[530px]:w-8 min-[530px]:h-8 rounded-md bg-white flex justify-center items-center">
                                                    <RxCaretLeft size={18} />
                                                </div>
                                                <div onClick={() => setVImagesIndex(prev => {
                                                    if (prev < vImages.length - 1) {
                                                        return prev + 1;
                                                    } else {
                                                        return 0;
                                                    }
                                                })} className="w-10 h-10 min-[530px]:w-8 min-[530px]:h-8 rounded-md bg-white flex justify-center items-center">
                                                    <RxCaretRight size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-y-2">
                                        <div className="w-[90%] grid grid-cols-5 gap-3">
                                            {vImages?.filter((item) => !!item.secure_url)?.map((item, idx) => (
                                                <div onClick={() => setVImagesIndex(idx)} key={`detail-image-${item.public_id}`} className={`w-full h-15 rounded-md bg-white ${idx === vImageIndex ? "border-template-primary border-2" : ""}`}>
                                                    <Image width={350} height={350} className="w-full h-full object-contain object-center aspect-square" src={`${item?.secure_url || '/images/pre-image-view.png'}`} alt={item?.public_id} />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex-col gap-y-6">
                                            <div className="flex flex-col gap-y-1">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-x-2">
                                                        <div className="w-2 h-2 rounded-full bg-template-primary" />
                                                        <div className="text-sm font-[500]">Amount Restocked: {inventoryUnits} QTY</div>
                                                    </div>
                                                    <div className="text-template-primary text-sm">{inventoryUnits}</div>
                                                </div>
                                                <div className={`h-2 w-full rounded-full bg-template-whitesmoke-dim relative`}>
                                                    <div style={{
                                                        width: ((inventoryUnits * 100) / (inventoryUnits + leastThreshold)) + "%"
                                                    }} className={`absolute left-0 top-0 h-full rounded-full bg-template-primary`} />
                                                </div>
                                                <div className="text-xs font-[500] text-black/70">Stock Level: {inventoryUnits < leastThreshold ? (
                                                    <span className="text-template-chart-gas">Low Stock <PiWarning size={10} className="inline-block" /></span>
                                                ) : (inventoryUnits === 0 ? (
                                                    <span className="text-red-500">Out Of Stock <PiWarning size={10} className="inline-block" /></span>
                                                ) : (
                                                    <span className="text-template-primary">In Stock <CheckCircle size={10} className="inline-block" /></span>
                                                ))}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-y-4">
                                    <div className="pb-3 border-b-[1.5px] border-dashed border-template-primary/40">
                                        <div className="flex flex-col gap-y-2">
                                            <div className="text-sm font-[400] text-black/60 ">{categories?.find(item => +item.id === +productsById?.category_id)?.name}</div>
                                            <div className="text-[17px] font-[550] min-[768px]:text-[20px] min-[768px]:font-[500] ">{productsById?.name}</div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-x-4">
                                                    <div className="text-sm font-[400] text-black/60  line-through">{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency", currencyDisplay: "symbol" }).format(totalCostPrice)}</div>
                                                    <div className="text-[19px] font-[600] ">{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency", currencyDisplay: "symbol" }).format(totalBaseCost)}</div>
                                                </div>
                                                {/* <div className="flex items-center gap-x-4">
                                                    <div className="text-sm text-black/60 font-[400] ">1,248 Sold</div>
                                                    <div className="flex items-center gap-x-1">
                                                        <IoIosStar size={15} className="text-template-orange" />
                                                        <div className="text-sm font-[500] ">4.5</div>
                                                    </div>
                                                </div> */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-y-2">
                                        <div className="text-[15px] font-bold ">Description:</div>
                                        <div className="text-[14.5px] min-[650px]:text-[14.5px] font-[400] pr-4">{productsById?.description}</div>
                                    </div>
                                    <div className="flex flex-col gap-y-2">
                                        <div className="text-sm font-[400] ">Category</div>
                                        <div className="text-[18px] font-[550]">{categories?.find(item => +item.id === +productsById?.category_id)?.name}</div>
                                    </div>
                                    <div className="flex flex-col gap-y-2">
                                        <div className="text-sm font-[400] ">Base Cost</div>
                                        <div className="text-[18px] font-[550]">{new Intl.NumberFormat("en-NG", { currency: "NGN", style: "currency", currencyDisplay: "symbol" }).format(totalBaseCost)}</div>
                                    </div>
                                    <div className="flex flex-col gap-y-2">
                                        <div className="text-sm font-[400] ">Brand</div>
                                        <div className="text-[18px] font-[550]">{productsById?.brand || ""}</div>
                                    </div>
                                    <div className="mt-6 w-full min-[650px]:w-[80%] grid grid-cols-2 gap-5">
                                        <button onClick={() => setShowEditFormVariant(true)} className="col-span-2 min-[650px]:col-auto w-full py-2.5 bg-template-primary text-white  font-[450] text-sm rounded-sm">Adjust</button>
                                        <button onClick={() => setShowReorderForm(true)} className="col-span-2 min-[650px]:col-auto w-full py-2.5 bg-white text-black  font-[450] text-sm rounded-sm">Re Order</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ProductAreaChart productId={+id} businessId={businessId} />
                    </div>
                ) : null}
            </div>
            {activeTab == 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-[500]">Movement History</CardTitle>
                        <CardTitle className="text-sm font-[450] text-black/50">Monitor the flow of your inventory in and out of your store</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTableWithNumberPagination columns={stockColumn} data={stockMovements} filterId="type" placeholderText="Search by Type..." isShowCost={false} displayedText="Stocks" />
                    </CardContent>
                </Card>
            )}
            {activeTab === 2 && (
                <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Product Suppliers</h3>
                        <button
                            onClick={() => setIsShow(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-template-primary hover:bg-template-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-template-primary transition-colors"
                        >
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Supplier
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pSuppliers && pSuppliers.length > 0 ? (
                            pSuppliers.map((supplier, index) => (
                                <div
                                    key={`product-supplier-${index}`}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-base font-medium text-gray-900">
                                                {supplier.name || `Supplier #${index + 1}`}
                                            </h4>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                #{index + 1}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <dl className="space-y-3">
                                            <div>
                                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Contact
                                                </dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {supplier.contact || 'Not specified'}
                                                </dd>
                                            </div>

                                            <div>
                                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Email
                                                </dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {'N/A'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Address
                                                </dt>
                                                <dd className="mt-1 text-sm text-gray-900">
                                                    {'N/A'}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-300 rounded-lg">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1}
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No suppliers</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Get started by adding a new supplier.
                                </p>
                                <div className="mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsShow(true)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-template-primary hover:bg-template-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-template-primary"
                                    >
                                        <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        New Supplier
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {(activeTab === 2 && isShow) && <SuppliersForm business_id={businessId} handleFormClose={() => setIsShow(false)} />}
            {activeTab == 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-[500]">Product Variations</CardTitle>
                        <CardTitle className="text-sm font-[450] text-black/50">Monitor the flow of your inventory variations in and out of your store</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTableWithNumberPagination
                            columns={productVariantsColumn}
                            data={variants?.map(variant => ({
                                ...variant,
                                expiry_date: variant.expiry_date ?? undefined
                            })) || []}
                            filterId="sku"
                            placeholderText="Search by SKU..."
                            isShowCost={false}
                            displayedText="Variations"
                        />
                    </CardContent>
                </Card>
            )}

            {(activeTab === 4) && <ChartFlow title="Product Variant Flow" content="Monitor the flow of your inventory in and out of your store" chart_data={chartData} />}

            {(showEditFormVariant || toggleState) && (
                <EditProductVariation handleFormClose={() => {
                    setShowEditFormVariant(false);
                    clearToggleState();
                }} productName={productsById?.name || ""} variants={variants || []} businessId={businessId} />
            )}
            {showReorderForm ? <CreateOrderForm handleFormClose={() => setShowReorderForm(false)} business_id={businessId} product_id={id} /> : null}
        </div>
    );
}

export default ProductView;