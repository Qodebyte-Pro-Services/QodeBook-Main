"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React, { ActionDispatch, AnyActionArg, useEffect, useMemo, useState } from 'react';
import { GoArrowLeft, GoPlus } from 'react-icons/go';
import { RxCross2 } from 'react-icons/rx';
import DropZone from '@/utils/dropzone';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RiLoader2Fill } from 'react-icons/ri';
import { MdRefresh } from 'react-icons/md';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import VariantManager from './variant-manager';
import VariantPricingTable from './variant-pricing-table';
import VariantsImageUpload from './variant-image-upload';
import { getProductAttributes, getProductCategories } from '@/api/controllers/get/handler';
import { CategoryPayload } from '@/models/types/shared/handlers-type';
import { useProductHandler } from '@/hooks/useHandlers';
import { CategoryForm } from '../forms';

const MAX_IMAGES = 6;

interface ImageState {
  name: string;
  file: File | null;
  preview: string;
  url: string | null;
  id: string | null;
  error: string | null;
  status: 'idle' | 'pending' | 'success' | 'error';
  isMain?: boolean;
  isUploaded?: boolean;
}

interface AddInventoryForm {
  name: string;
  brand: string;
  basePrice: string;
  sellingPrice: string;
  category: string;
  category_id: string;
  threshold: string;
  unit: string;
  description: string;
  baseSku: string;
  taxable: boolean;
  hasVariation: boolean;
  featured?: boolean;
}

interface VariantOption {
  name: string;
  values: string[];
  type: 'text' | 'number' | 'color' | 'range' | 'dropdown';
  isCustom: boolean;
  immutable: boolean;
}

interface BaseOption {
  name: string;
  type: 'text' | 'number' | 'color' | 'range' | 'dropdown';
  values?: string[];
  immutable?: boolean;
  id?: number;
  business_id?: number;
}

interface VariantCombination {
  id: string;
  attributes: Record<string, string>;
  price: string;
  costPrice?: string;
  quantity: string;
  sku: string;
  weight: string;
  images: ImageState[];
}

interface CategoryData {
  _id: string;
  category: string;
  options: BaseOption[];
}

interface SellerData {
  [key: string]: any;
}

function ImageUpload({
  image,
  onImageStateChange,
  onRemove,
  isSubmitting,
  index,
  isRemoving
}: {
  image: ImageState;
  onImageStateChange: (newState: Partial<ImageState>) => void;
  onRemove: (imageId: string | null) => void;
  isSubmitting: boolean;
  index: number;
  isRemoving: boolean;
}) {
  const handleFileSelect = (file: File) => {
    onImageStateChange({
      file,
      error: null,
      status: 'success',
      isUploaded: false
    });
  };

  const handleRemove = () => {
    onImageStateChange({
      file: null,
      preview: '',
      url: null,
      id: null,
      error: null,
      status: 'idle',
      isUploaded: false
    });
  };

  const handleCancelUpload = () => {
    onImageStateChange({
      file: null,
      preview: '',
      error: null,
      status: 'idle',
      isUploaded: false
    });
  };

  const handleRetry = () => {
    if (image.file) {
      onImageStateChange({ status: 'success', isUploaded: false });
    }
  }

  type FileSetter = (prev: Record<string, File | null>) => Record<string, File | null>;
  // type PreviewSetter = (url: string) => void;

  return (
    <div className="relative group/delete dark:bg-black">
      <div className="relative">
        <DropZone
          file={image.file}
          setFile={(setter: FileSetter) => {
            const file = setter({})[image.name];
            onImageStateChange({ file, status: 'success' as const, isUploaded: false });
          }}
          setPreview={(previewUrl: string) => {
            onImageStateChange({ preview: previewUrl });
          }}
          preview={image.preview}
          name={image.name}
          onDrop={handleFileSelect}
          disabled={isSubmitting}
          className={image.isMain ? '!h-[250px]' : '!h-[150px]'}
          uploadText={image.isMain ? 'Upload Main Image' : 'Upload Image'}
          uploadFormats="PNG, JPG, GIF up to 10MB"
        />
        {image.status === 'error' && (
          <div className="absolute inset-0 bg-primary/30 flex items-center justify-center rounded">
            <div className="text-red-500 text-center">
              <p className="text-sm">File selection failed!</p>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-2 p-2 bg-primary rounded-full hover:bg-primary/80 transition-colors"
                  aria-label="Retry selection"
                  disabled={isSubmitting}
                >
                  <MdRefresh className="text-white" size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleCancelUpload}
                  className="mt-2 p-2 bg-primary rounded-full hover:bg-primary/80 transition-colors"
                  aria-label="Cancel selection"
                  disabled={isSubmitting}
                >
                  <RxCross2 className="text-white" size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {image.preview && image.status !== 'pending' && index > 2 && (
        <div
          className="absolute top-2 right-2 p-1 bg-white text-primary rounded-md z-10 cursor-pointer opacity-0 group-hover/delete:opacity-100 transition-opacity"
          onClick={handleRemove}
        >
          {isRemoving ? <RiLoader2Fill className="animate-spin" /> : <RxCross2 />}
        </div>
      )}
      {image.preview && image.status === 'success' && index <= 2 && (
        <div
          className="absolute top-2 right-2 p-1 bg-white text-primary rounded-md z-10 cursor-pointer opacity-0 group-hover/delete:opacity-100 transition-opacity"
          onClick={handleRemove}
        >
          {isRemoving ? <RiLoader2Fill className="animate-spin" /> : <RxCross2 />}
        </div>
      )}
      {!image.preview && index > 2 && (
        <div
          className="absolute top-2 right-2 p-1 bg-white text-primary rounded-md z-10 cursor-pointer opacity-0 group-hover/delete:opacity-100 transition-opacity"
          onClick={handleRemove}
        >
          {isRemoving ? <RiLoader2Fill className="animate-spin" /> : <RxCross2 />}
        </div>
      )}
    </div>
  );
}

export default function AddInventory({ sellerData, businessId, switchToTable }: { sellerData?: SellerData, handleCategorySlide?: () => void, businessId: number; switchToTable?: () => void; }) {
  const [enabledVariant, setEnabledVariant] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [addInventoryForm, setAddInventoryForm] = useState<AddInventoryForm>({
    name: "",
    brand: "",
    basePrice: "",
    sellingPrice: "",
    category: "",
    category_id: "",
    threshold: "10",
    unit: "piece",
    description: "",
    baseSku: "",
    taxable: true,
    hasVariation: false,
    featured: false,
  });

  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([]); // => variant manager
  const [variantCombinations, setVariantCombinations] = useState<VariantCombination[]>([]);
  const [showVariantTable, setShowVariantTable] = useState<boolean>(false);
  const [categoryFetchedData, setCategoryFetchedData] = useState<CategoryData[]>([]);

  const [showCategoryForm, setShowCategoryForm] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  const { data: productCategories = { categories: [] }, isLoading: isCategory } = useQuery<{ categories: CategoryPayload[] }>({
    queryKey: ['get-categories', businessId],
    queryFn: async () => await getProductCategories(businessId),
    enabled: businessId !== 0,
  });
  const { data: productAttributes = { attributes: [], rawAttributes: [] }, isLoading: isAttribute } = useQuery<{ attributes: BaseOption[]; rawAttributes: any[] }>({
    queryKey: ['product_variants', businessId],
    queryFn: async () => {
      const anyRes: any = await getProductAttributes(businessId);

      const list: any[] = Array.isArray(anyRes)
        ? anyRes
        : (Array.isArray(anyRes?.data)
          ? anyRes.data
          : (Array.isArray(anyRes?.attributes)
            ? anyRes.attributes
            : (anyRes ? [anyRes] : [])));

      const attributes: BaseOption[] = list.map((a: any): BaseOption => {
        const name = String(a?.name ?? a?.attribute ?? '').trim();
        let values: string[] = [];
        const rawVals = a?.values ?? a?.options ?? a?.items;
        if (Array.isArray(rawVals)) {
          values = rawVals.map((v: any) => {
            if (v == null) return '';
            if (typeof v === 'string') return v;
            if (typeof v?.value === 'string') return v.value;
            if (typeof v?.name === 'string') return v.name;
            return String(v);
          }).filter(Boolean);
        }
        return {
          id: a?.id,
          business_id: a?.business_id,
          name,
          type: values.length > 0 ? 'dropdown' : 'text',
          values,
          immutable: false,
        };
      });
      return { attributes, rawAttributes: list };
    },
    enabled: typeof businessId !== "undefined",
    refetchOnWindowFocus: 'always'
  });

  const productHandler = useProductHandler();

  useEffect(() => {
    const attrs = productAttributes?.attributes ?? [];
    if (!attrs.length) return;

    setVariantOptions(prevOptions => {
      if (!prevOptions.length) return prevOptions;

      const map = new Map(
        attrs.map(a => [String(a.name ?? '').trim().toLowerCase(), a.values ?? []])
      );

      const updated = prevOptions.map(opt => {
        const key = String(opt.name ?? '').trim().toLowerCase();
        const latestValues = map.get(key) ?? [];
        
        // Always update with latest values from attributes
        // This ensures newly added values appear immediately
        return latestValues.length 
          ? { ...opt, values: latestValues } 
          : opt;
      });

      // Check if any values actually changed
      const changed = updated.some((o, i) => {
        const oldValues = prevOptions[i]?.values ?? [];
        const newValues = o.values ?? [];
        // Compare lengths and content
        return oldValues.length !== newValues.length || 
               oldValues.some((v, idx) => v !== newValues[idx]);
      });
      
      return changed ? updated : prevOptions;
    });
  }, [productAttributes?.attributes]);

  const handleCategoryChange = (value: string) => {
    setAddInventoryForm(prev => ({ ...prev, category: value }));

    const selectedCategory = categoryFetchedData.find(cat => cat.category === value);
    const options = selectedCategory ? selectedCategory.options : [];

    const attrMap = new Map<string, string[]>(
      (productAttributes?.attributes ?? []).map(a => [String(a.name ?? '').trim().toLowerCase(), a.values ?? []])
    );

    const initialOptions: VariantOption[] = options.slice(0, 2).map(opt => {
      const key = String(opt.name ?? '').trim().toLowerCase();
      const hydrated = (opt.values && opt.values.length > 0)
        ? opt.values
        : (attrMap.get(key) ?? []);
      const type: VariantOption['type'] = hydrated.length > 0 ? 'dropdown' : opt.type;
      return {
        name: opt.name,
        type,
        values: hydrated, // This will prefill all values as chips
        isCustom: false,
        immutable: opt.immutable || false
      };
    });

    setVariantOptions(initialOptions);
    setVariantCombinations([]);
  };

  const generateCombinations = () => {
    if (!variantOptions || variantOptions.length === 0) {
      return;
    }

    const activeOptions = variantOptions.filter(opt => opt.values && opt.values.length > 0);
    if (activeOptions.length === 0) {
      toast.warning("Please add at least one value to an option to generate variants.");
      return;
    }

    const [firstOption, ...restOptions] = activeOptions;

    let combinations = firstOption.values.map(value => ({
      [firstOption.name]: value
    }));

    for (const option of restOptions) {
      const newCombinations = [];
      for (const combination of combinations) {
        for (const value of option.values) {
          newCombinations.push({
            ...combination,
            [option.name]: value
          });
        }
      }
      combinations = newCombinations;
    }

    const newCombinations = combinations.map(attributes => ({
      id: Object.values(attributes).join('-'),
      attributes,
      price: addInventoryForm.basePrice,
      quantity: '',
      sku: '',
      weight: '',
      images: [
        { name: `${Object.values(attributes).join('-')}_image_0`, file: null, preview: '', url: null, id: null, error: null, status: 'idle' as const, isUploaded: false },
        { name: `${Object.values(attributes).join('-')}_image_1`, file: null, preview: '', url: null, id: null, error: null, status: 'idle' as const, isUploaded: false }
      ]
    }));

    setVariantCombinations(newCombinations);
  };

  const queryClient = useQueryClient();

  const [images, setImages] = useState<ImageState[]>([
    { name: 'main_image_0', file: null, preview: '', url: null, id: null, error: null, status: 'idle', isMain: true, isUploaded: false },
    { name: 'add_image_1', file: null, preview: '', url: null, id: null, error: null, status: 'idle', isMain: false, isUploaded: false },
    { name: 'add_image_2', file: null, preview: '', url: null, id: null, error: null, status: 'idle', isMain: false, isUploaded: false },
  ]);

  // const { mutate: deleteFile, isPending: isDeletingFile } = useDeleteFile();

  // const { mutate: createProduct, isPending: isCreatingProduct } = useMutation({
  //   mutationFn: sellerApi.createProduct,
  //   onSuccess: () => {
  //     toast.success('Product created successfully!');
  //   },
  //   onError: (error: any) => {
  //     toast.error(error.response?.data?.message || 'Failed to create product.');
  //   }
  // });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setAddInventoryForm((prev) => {
      const updatedForm = { ...prev, [id]: value };

      if (id === 'name' || id === 'brand') {
        const newSku = generateSku(
          id === 'name' ? value : prev.name,
          id === 'brand' ? value : prev.brand
        );
        updatedForm.baseSku = newSku;

        const variantName = `${id === 'name' ? value : prev.name} - ${id === 'brand' ? value : prev.brand}`;
        setSimpleProduct(prev => ({ ...prev, variantName }));
      }

      return updatedForm;
    });
  };

  const handleSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/[^\d]/g, '');
    setAddInventoryForm((prev) => ({ ...prev, sellingPrice: input }));
  };

  const handleSimpleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSimpleProduct((prev) => ({ ...prev, [id]: value }));
  };

  const generateSku = (name: string, brand: string) => {
    if (!name && !brand) return "";

    const namePart = name ? name.replace(/[^A-Za-z0-9]/g, '').toUpperCase().substring(0, 6) : "";
    const brandPart = brand ? brand.replace(/[^A-Za-z0-9]/g, '').toUpperCase().substring(0, 3) : "";

    if (namePart && brandPart) {
      return `${namePart}-${brandPart}`;
    } else if (namePart) {
      return namePart;
    } else if (brandPart) {
      return brandPart;
    }

    return "";
  };

  const handleImageStateChange = (index: number, newImageState: Partial<ImageState>) => {
    setImages(currentImages =>
      currentImages.map((img, i) => (i === index ? { ...img, ...newImageState } : img))
    );
  };

  const handleRemoveImage = async (index: number, imageId: string | null) => {
    setIsRemoving(true);
    try {
      await new Promise(res => setTimeout(res, 1500));
      setImages(currentImages => {
        const imageToRemove = currentImages[index];
        if (imageToRemove.isMain || index <= 2) {
          return currentImages.map((img, i) =>
            i === index ? { ...img, file: null, preview: '', url: null, id: null, error: null, status: 'idle' as const, isUploaded: false } : img
          );
        }
        return currentImages.filter((_, i) => i !== index);
      });
    } catch (error) {
      toast.error("Failed to remove image");
    } finally {
      setIsRemoving(false);
    }
  };

  const addImageSlot = () => {
    if (images.length < MAX_IMAGES) {
      setImages(prev => [...prev, { name: `add_image_${prev.length}`, file: null, preview: '', url: null, id: null, error: null, status: 'idle', isMain: false, isUploaded: false }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (!addInventoryForm.name || !addInventoryForm.brand) {
        toast.error("Please fill in all required fields.");
        return;
      }

      const selectedImages = images.filter(img => img.file && img.file !== null);
      if (selectedImages.length === 0) {
        toast.error("Please upload at least one image.");
        return;
      }

      const selectedCategory = productCategories?.categories?.find(cat => cat.name === addInventoryForm.category);
      const categoryId = selectedCategory?.id || "";

      if (!categoryId) {
        toast.error("Please select a valid category.");
        return;
      }

      const mainProductImages: File[] = [];
      const variantImages: { [key: string]: File[] } = {};

      selectedImages.forEach(image => {
        if (image.file) {
          mainProductImages.push(image.file);
        }
      });

      if (addInventoryForm.hasVariation && variantCombinations.length > 0) {
        variantCombinations.forEach(variant => {
          const variantImagesForCombination: File[] = [];
          variant.images.forEach(image => {
            if (image.file) {
              variantImagesForCombination.push(image.file);
            }
          });
          if (variantImagesForCombination.length > 0) {
            variantImages[variant.id] = variantImagesForCombination;
          }
        });
      }

      if (addInventoryForm.hasVariation) {
        if (variantCombinations.length === 0) {
          toast.error("Please add at least one variant before submitting.");
          return;
        }

        const hasMissingFields = variantCombinations.some(v =>
          !v.price || Number(v.price) <= 0 ||
          !v.quantity || Number(v.quantity) <= 0
        );

        if (hasMissingFields) {
          toast.error("Please fill in price and quantity for all variants.");
          return;
        }

        const attributes = variantOptions.map(option => ({
          name: option.name,
          values: option.values
        }));

        // where i dey generate SKU
        const variants = variantCombinations.map((v, index) => {
          const attributeValues = Object.values(v.attributes).join('-');
          const sku = `${addInventoryForm.baseSku}-${attributeValues}`;

          return {
            attributes: v.attributes,
            sku: sku,
            cost_price: Number(v.costPrice),
            selling_price: Number(v.price),
            quantity: Number(v.quantity),
            threshold: Number(addInventoryForm.threshold),
            barcode: `${sku}-${Date.now()}-${index}`,

            image_url: variantImages[v.id] ?? []
          };
        });

        const payload = {
          businessId,
          category_id: categoryId,
          name: addInventoryForm.name,
          brand: addInventoryForm.brand,
          description: addInventoryForm.description,
          base_sku: addInventoryForm.baseSku,
          taxable: addInventoryForm.taxable,
          threshold: Number(addInventoryForm.threshold),
          unit: addInventoryForm.unit,
          hasVariation: true,
          image_url: mainProductImages,
          attributes: attributes,
          variants: variants
        };

        const formData = new FormData();
        formData.append('business_id', String(payload.businessId));
        formData.append('category_id', String(payload.category_id));
        formData.append('name', payload.name);
        formData.append('brand', payload.brand);
        formData.append('description', payload.description);
        if (payload.base_sku) formData.append('base_sku', payload.base_sku);
        if (typeof payload.taxable === 'boolean') formData.append('taxable', String(payload.taxable));
        if (!Number.isNaN(payload.threshold)) formData.append('threshold', String(payload.threshold));
        formData.append('unit', payload.unit);
        formData.append('hasVariation', String(payload.hasVariation));
        payload.image_url.forEach((file) => {
          if (file) formData.append('image_url', file);
        });
        formData.append('attributes', JSON.stringify(payload.attributes || []));
        const variantsMeta = payload.variants.map(v => ({
          ...v,
          image_url: [] as string[],
        }));
        formData.append('variants', JSON.stringify(variantsMeta));
        payload.variants.forEach((v, i) => {
          v.image_url.forEach((file) => {
            if (file) formData.append(`variants[${i}][image_url]`, file);
          });
        });

        try {
          await productHandler.mutateAsync(formData, {
            onSuccess: (data) => {
              queryClient.invalidateQueries({
                queryKey: ["get-products", businessId],
                refetchType: "active"
              });
              toast.success("Product added successfully!");
              clearFormData();
            },
            onError: (err) => {
              toast.error((err instanceof Error && err?.message) || "Failed to add product");
              console.log(err);
            }
          })
        } catch (err) {
          toast.error((err instanceof Error && err?.message) || "Failed to add product");
          console.log(err);
        }
      } else {
        if (!simpleProduct.costPrice || !simpleProduct.sellingPrice || !simpleProduct.quantity) {
          toast.error("Please fill in all required fields in the simple product table.");
          return;
        }

        if (Number(simpleProduct.costPrice) <= 0 || Number(simpleProduct.sellingPrice) <= 0 || Number(simpleProduct.quantity) <= 0) {
          toast.error("Cost price, selling price, and quantity must be greater than 0.");
          return;
        }

        const payload = {
          businessId,
          category_id: categoryId,
          name: addInventoryForm.name,
          brand: addInventoryForm.brand,
          description: addInventoryForm.description,
          base_sku: addInventoryForm.baseSku,
          taxable: addInventoryForm.taxable,
          threshold: Number(simpleProduct.threshold),
          unit: addInventoryForm.unit,
          hasVariation: false,
          image_url: mainProductImages,
          attributes: [],
          variants: [
            {
              attributes: {
                "product-name": addInventoryForm.name,
                "brand": addInventoryForm.brand
              },
              sku: `${addInventoryForm.baseSku}-01`,
              cost_price: Number(simpleProduct.costPrice),
              selling_price: Number(simpleProduct.sellingPrice),
              quantity: Number(simpleProduct.quantity),
              threshold: Number(simpleProduct.threshold),
              image_url: mainProductImages,
              barcode: `${addInventoryForm.baseSku}-${Date.now()}`
            }
          ],
        };

        const formData = new FormData();
        formData.append('business_id', String(payload.businessId));
        formData.append('category_id', String(payload.category_id));
        formData.append('name', payload.name);
        formData.append('brand', payload.brand);
        formData.append('description', payload.description);
        if (payload.base_sku) formData.append('base_sku', payload.base_sku);
        if (typeof payload.taxable === 'boolean') formData.append('taxable', String(payload.taxable));
        if (!Number.isNaN(payload.threshold)) formData.append('threshold', String(payload.threshold));
        formData.append('unit', payload.unit);
        formData.append('hasVariation', String(payload.hasVariation));

        for (const file of payload.image_url) {
          if (file) {
            const arrayBuffer = await file.arrayBuffer();
            const blob = new Blob([arrayBuffer], { type: file.type });
            formData.append('image_url', blob, file.name);
          }
        }
        formData.append('attributes', JSON.stringify(payload.attributes || []));
        const { image_url, ...rest } = payload?.variants?.[0];
        const product_formdata = [{ ...rest }];
        formData.append('variants', JSON.stringify(product_formdata || []));

        for (const file of image_url) {
          if (file) {
            const arrayBuffer = await file.arrayBuffer();
            const blob = new Blob([arrayBuffer], { type: file.type });
            formData.append('variants[0][image_url]', blob, file.name);
          }
        }

        try {
          await productHandler.mutateAsync(formData, {
            onSuccess: (data) => {
              toast.success("Product added successfully!", { description: "Page will refresh in 4 seconds" });
              clearFormData();
              queryClient.invalidateQueries({
                queryKey: ["get-products", businessId],
                refetchType: "active"
              });
              console.log(data);
            },
            onError: (err) => {
              toast.error((err as any)?.message || "Failed to add product");
              clearFormData();
              console.log(err);
            }
          });
        } catch (err) {
          toast.error((err instanceof Error && err?.message) || "Failed to add product");
          console.log(err);
        }
      }
    } catch (error) {
      toast.error("Failed to process form submission.");
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mainImage = images[0];
  const additionalImages = images.slice(1);

  const { isLoading: isLoadingCategories, data: categoryData } = useQuery({
    queryKey: ['get-categories', businessId],
    queryFn: () => getProductCategories(businessId),
    refetchOnWindowFocus: false,
    retry: false,
    enabled: businessId !== 0
  });

  useEffect(() => {
    if (categoryData) {
      setCategoryFetchedData(categoryData?.categories);
    }
  }, [categoryData]);


  useEffect(() => {
    if (addInventoryForm.name && addInventoryForm.brand) {
      const variantName = `${addInventoryForm.name} - ${addInventoryForm.brand}`;
      setSimpleProduct(prev => ({ ...prev, variantName }));
    }
  }, [addInventoryForm.name, addInventoryForm.brand]);

  const handleVariantToggle = () => {
    if (!addInventoryForm.category) {
      toast.info("Please select a category first");
    }
  }

  const [addVariantImage, setAddVariantImage] = useState<boolean>(false);

  const [simpleProduct, setSimpleProduct] = useState({
    costPrice: "",
    sellingPrice: "",
    quantity: "",
    threshold: "10",
    variantName: ""
  });

  const handleAddVariantImage = () => {
    if (!variantCombinations.length) {
      toast.info("Please generate variants first");
    }
  }

  const clearFormData = () => {
    // Reset main form
    setAddInventoryForm({
      name: "",
      brand: "",
      basePrice: "",
      sellingPrice: "",
      category: "",
      category_id: "",
      threshold: "10",
      unit: "piece",
      description: "",
      baseSku: "",
      taxable: true,
      hasVariation: true,
      featured: false,
    });

    // Reset simple product
    setSimpleProduct({
      costPrice: "",
      sellingPrice: "",
      quantity: "",
      threshold: "10",
      variantName: ""
    });

    // Reset images to initial state
    setImages([
      { name: 'main_image_0', file: null, preview: '', url: null, id: null, error: null, status: 'idle', isMain: true, isUploaded: false },
      { name: 'add_image_1', file: null, preview: '', url: null, id: null, error: null, status: 'idle', isMain: false, isUploaded: false },
      { name: 'add_image_2', file: null, preview: '', url: null, id: null, error: null, status: 'idle', isMain: false, isUploaded: false },
    ]);

    // Reset variant-related states
    setVariantOptions([]);
    setVariantCombinations([]);
    setShowVariantTable(false);
    setEnabledVariant(false);
    setAddVariantImage(false);
  };

  return (
    <>
      <div className="flex items-center dark:text-white dark:bg-black gap-4 justify-between mb-4 flex-wrap">
        <p className="text-sm font-medium w-[50%] md:w-fit">New Inventory Item</p>
        <div className='flex items-center gap-5'>
          <Button onClick={() => switchToTable?.()} className="!gap-1 cursor-pointer" variant="outline">
            <GoArrowLeft />
            Back
          </Button>
          <Button onClick={() => handleSubmit({ preventDefault: () => { } } as React.FormEvent<HTMLFormElement>)} disabled={isSubmitting} className="flex items-center gap-2 bg-template-chart-store cursor-pointer text-sm text-white px-4 py-2 rounded-md">
            {(isSubmitting) && <RiLoader2Fill className="animate-spin" />} Save & Publish
          </Button>
        </div>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-[58%_40%] gap-5 lg:gap-[2%] overflow-hidden'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 bg-white dark:bg-black p-5 rounded-md h-fit'>
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-[14px]">
              Product Name*
            </label>
            <input
              id="name"
              type="text"
              value={addInventoryForm.name}
              onChange={handleChange}
              className="border rounded-md outline-0 py-2 px-3 placeholder:text-[14px]"
              placeholder="Product Name"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="brand" className="text-[14px]">
              Brand*
            </label>
            <input
              id="brand"
              type="text"
              value={addInventoryForm.brand}
              onChange={handleChange}
              className="border rounded-md outline-0 py-2 px-3 placeholder:text-[14px]"
              placeholder="Enter brand name"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="category" className="text-[14px]">
                Category
              </label>
              <Select onValueChange={handleCategoryChange} value={addInventoryForm.category} disabled={isLoadingCategories}>
                <SelectTrigger className="w-full cursor-pointer py-5">
                  <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {productCategories?.categories?.map((cat: CategoryPayload) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p onClick={() => setShowCategoryForm(true)} className="text-xs text-primary flex items-center gap-1 py-1 cursor-pointer w-fit"><GoPlus size={17} /> Add new category</p>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="unit" className="text-[14px]">
                Unit
              </label>
              <input
                id="unit"
                type="text"
                value={addInventoryForm.unit}
                onChange={handleChange}
                className="border rounded-md outline-0 py-2 px-3 placeholder:text-[14px]"
                placeholder="e.g. piece, kg, etc."
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="baseSku" className="text-[14px] flex items-center gap-1">
              Base SKU* <span className="text-xs text-gray-500">(Auto-generated)</span>
            </label>
            <input
              id="baseSku"
              type="text"
              value={addInventoryForm.baseSku}
              onChange={handleChange}
              className="border rounded-md outline-0 py-2 px-3 placeholder:text-[14px] bg-gray-50 dark:bg-black"
              placeholder="Auto-generated from product name"
              required
              readOnly
            />
          </div>
          <div className="flex flex-col gap-4">
            {/* <div className="flex items-center gap-2">
              <Checkbox
                id="featured"
                checked={addInventoryForm.featured}
                onCheckedChange={(checked: boolean) =>
                  setAddInventoryForm((prev) => ({ ...prev, featured: checked }))
                }
              />
              <label
                htmlFor="featured"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Featured
              </label>
            </div> */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="taxable"
                checked={addInventoryForm.taxable}
                onCheckedChange={(checked: boolean) =>
                  setAddInventoryForm((prev) => ({ ...prev, taxable: checked }))
                }
              />
              <label
                htmlFor="taxable"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Taxable
              </label>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Has Variations</label>
              <Switch
                checked={addInventoryForm.hasVariation}
                onCheckedChange={(checked: boolean) =>
                  setAddInventoryForm((prev) => ({ ...prev, hasVariation: checked }))
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-[14px]">
              Product Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={addInventoryForm.description}
              onChange={handleChange}
              className="border rounded-md outline-0 py-2 px-3 placeholder:text-[14px]"
              placeholder="Product Description"
              required
            />
          </div>

          {/* Main Image Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px]">Product Image*</label>
            <ImageUpload
              index={0}
              image={mainImage}
              isRemoving={isRemoving}
              onImageStateChange={(newState) => handleImageStateChange(0, newState)}
              onRemove={(id) => handleRemoveImage(0, id)}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* Additional Images */}
          <div>
            <div className='flex justify-between items-center mb-4'>
              <label className="text-[14px]">Additional Images</label>
              {images.length < MAX_IMAGES && (
                <div onClick={addImageSlot} className="bg-template-chart-store text-white text-xs h-auto py-2 px-5 rounded-sm cursor-pointer">Add more</div>
              )}
            </div>
            <div className='grid grid-cols-2 gap-4'>
              {additionalImages.map((image, index) => (
                <ImageUpload
                  index={index + 1}
                  key={image.name}
                  image={image}
                  isRemoving={isRemoving}
                  onImageStateChange={(newState) => handleImageStateChange(index + 1, newState)}
                  onRemove={(id) => handleRemoveImage(index + 1, id)}
                  isSubmitting={isSubmitting}
                />
              ))}
            </div>
          </div>
        </form>
        {addInventoryForm.hasVariation && (
          <div className='bg-white dark:bg-black p-4 rounded-md h-fit flex flex-col gap-4 mb-10'>
            <div className='flex items-center justify-between'>
              <h3 className='font-medium'>Variant Management</h3>
              <div className='relative rounded-full' >
                <Switch
                  disabled={!addInventoryForm.category}
                  checked={enabledVariant}
                  onCheckedChange={setEnabledVariant}
                />
                {!addInventoryForm.category && <div onClick={handleVariantToggle} className='!z-10 cursor-not-allowed absolute top-0 left-0 w-full h-full rounded-full' />}
              </div>
            </div>
            {enabledVariant && (
              <>
                <VariantManager
                  options={variantOptions}
                  setOptions={setVariantOptions}
                  baseOptions={productAttributes?.attributes || []}
                  attributes={productAttributes?.rawAttributes || []}
                  businessId={businessId}
                  onAttributesUpdated={() => queryClient.invalidateQueries({ queryKey: ['product_variants', businessId] })}
                />

                <div className="mt-4">
                  <Button
                    type="button"
                    onClick={() => {
                      generateCombinations();
                      setShowVariantTable(true);
                    }}
                    className="w-full bg-template-chart-store text-slate-100 hover:bg-template-chart-store"
                  >
                    Generate Variants
                  </Button>
                </div>

                {showVariantTable && variantCombinations.length > 0 && (
                  <div className='mt-4'>
                    <VariantPricingTable
                      combinations={variantCombinations}
                      setCombinations={setVariantCombinations}
                      basePrice={addInventoryForm.basePrice}
                    />
                  </div>
                )}

                <div>
                  <div className='flex items-center justify-between'>
                    <h3>Add image to Variant</h3>
                    <div className='relative rounded-full'>
                      <Switch checked={addVariantImage} onCheckedChange={setAddVariantImage} />
                      {variantCombinations.length === 0 && <div onClick={handleAddVariantImage} className='!z-10 cursor-not-allowed absolute top-0 left-0 w-full h-full rounded-full' />}
                    </div>
                  </div>
                  {addVariantImage && variantCombinations.length > 0 &&
                    <VariantsImageUpload
                      combinations={variantCombinations}
                      setCombinations={setVariantCombinations}
                      ImageUploadComponent={ImageUpload}
                      imageState={{
                        isCreatingProduct: isSubmitting,
                        // deleteFile: (fileId: string, options: { onSuccess: () => void }) => {
                        //   deleteFile(fileId, { onSuccess: options.onSuccess });
                        // }
                      }}
                    />
                  }
                </div>
              </>
            )}
          </div>
        )}

        {!addInventoryForm.hasVariation && (
          <div className='bg-white dark:bg-black p-4 rounded-md h-fit flex flex-col gap-4 mb-10'>
            <div className='flex items-center justify-between'>
              <h3 className='font-medium'>Simple Product Details</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50 dark:bg-black">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Variant Name</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Cost Price (₦)</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Selling Price (₦)</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Quantity</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="text"
                        value={simpleProduct.variantName}
                        onChange={handleSimpleProductChange}
                        id="variantName"
                        className="w-full border-none outline-none bg-transparent"
                        placeholder="Auto-generated from product name and brand"
                        readOnly
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="text"
                        value={simpleProduct.costPrice}
                        onChange={handleSimpleProductChange}
                        id="costPrice"
                        className="w-full border-none outline-none bg-transparent"
                        placeholder="Enter cost price"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="text"
                        value={simpleProduct.sellingPrice}
                        onChange={handleSimpleProductChange}
                        id="sellingPrice"
                        className="w-full border-none outline-none bg-transparent"
                        placeholder="Enter selling price"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="number"
                        value={simpleProduct.quantity}
                        onChange={handleSimpleProductChange}
                        id="quantity"
                        className="w-full border-none outline-none bg-transparent"
                        placeholder="Enter quantity"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="number"
                        value={simpleProduct.threshold}
                        onChange={handleSimpleProductChange}
                        id="threshold"
                        className="w-full border-none outline-none bg-transparent"
                        placeholder="Enter threshold"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {showCategoryForm && (
          <CategoryForm
            handleFormClose={() => setShowCategoryForm(false)}
            businessId={+businessId}
          />
        )}
      </div>
    </>
  );
}