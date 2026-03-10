"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { TabList } from "..";
import { useCustomStyles } from "@/hooks";
import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import { createConfigUnitColumns } from "@/components/data-table/data-config-units-columns";
import { createConfigCategoryColumns } from "@/components/data-table/data-config-category-columns";
import { createConfigTaxesColumns } from "@/components/data-table/data-config-taxes-columns";
import { createConfigDiscountsColumns } from "@/components/data-table/data-config-discounts-columns";
import { createConfigCouponsColumns } from "@/components/data-table/data-config-coupons-columns";
import { ConfigUnitTask } from "@/store/data/config-unit-data";
import { ConfigTaxesTask } from "@/store/data/config-taxes-data";
import { ConfigCategoryTask } from "@/store/data/config-category-data";
import { ConfigDiscountsTask } from "@/store/data/config-discounts-data";
import { ConfigCouponsTask } from "@/store/data/config-coupons-data";
import { ColumnDef } from "@tanstack/react-table";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/config/store-config";
import { setTableCurrentId } from "@/store/state/lib/manage-store";
import { useQuery } from "@tanstack/react-query";
import { getProductAttributes, getProductCategories, getProductTaxes, getProductDiscounts, getProductCoupons } from "@/api/controllers/get/handler";

type TableData = ConfigCategoryTask | ConfigUnitTask | ConfigTaxesTask | ConfigDiscountsTask | ConfigCouponsTask;

interface TabConfig {
  name: string;
  columns: ColumnDef<TableData>[];
  filterId: string;
}

const ConfigTables = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { hiddenScrollbar } = useCustomStyles();
  
  const listRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [activeList, setActiveList] = useState<number>(0);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  
  const businessId = useMemo(() => {
    if (typeof window !== 'undefined') {
      const storedId = sessionStorage.getItem("selectedBusinessId");
      return storedId ? Number(storedId) : 0;
    }
    return 0;
  }, []);

  const { data: configCategoryData = { categories: [] }, isLoading: isConfigCategory } = useQuery({
    queryKey: ["get-categories", businessId],
    queryFn: () => getProductCategories(businessId),
    enabled: businessId !== 0,
    refetchOnWindowFocus: 'always',
  });

  const { data: configAttributesData = { attributes: [] }, isLoading: isConfigAttributes } = useQuery({
    queryKey: ["get-attributes", businessId],
    queryFn: () => getProductAttributes(businessId),
    enabled: businessId !== 0,
    refetchOnWindowFocus: 'always',
  });

  const {data: configTaxes = {taxes: []}, isLoading: isConfigTaxes} = useQuery({
    queryKey: ['get-taxes', businessId],
    queryFn: () => getProductTaxes({businessId: +businessId!}),
    enabled: !!businessId,
    refetchOnWindowFocus: false,
  });

  const {data: configDiscounts = {discounts: []}, isLoading: isConfigDiscounts} = useQuery({
    queryKey: ['get-discounts', businessId],
    queryFn: () => getProductDiscounts({businessId: +businessId!}),
    enabled: !!businessId,
    refetchOnWindowFocus: false,
  });

  const {data: configCoupons = {coupons: []}, isLoading: isConfigCoupons} = useQuery({
    queryKey: ['get-coupons', businessId],
    queryFn: () => getProductCoupons({businessId: +businessId!}),
    enabled: !!businessId,
    refetchOnWindowFocus: false,
  });

  const tabConfigs: TabConfig[] = useMemo(() => [
    {
      name: "Category",
      columns: createConfigCategoryColumns(businessId) as ColumnDef<TableData>[],
      filterId: "name"
    },
    {
      name: "Attributes",
      columns: createConfigUnitColumns(businessId) as ColumnDef<TableData>[],
      filterId: "name"
    },
    {
      name: "Taxes",
      columns: createConfigTaxesColumns(businessId) as ColumnDef<TableData>[],
      filterId: "name"
    },
    {
      name: "Discounts",
      columns: createConfigDiscountsColumns(businessId) as ColumnDef<TableData>[],
      filterId: "name"
    },
    {
      name: "Coupons",
      columns: createConfigCouponsColumns(businessId) as ColumnDef<TableData>[],
      filterId: "code"
    }
  ], [businessId]);

  const tableData = useMemo(() => [
    configCategoryData?.categories || [],
    configAttributesData?.attributes || [],
    configTaxes?.taxes || [],
    configDiscounts?.discounts || [],
    configCoupons?.coupons || [],
  ], [configCategoryData?.categories, configAttributesData?.attributes, configTaxes?.taxes, configDiscounts?.discounts, configCoupons?.coupons]);

  const currentTable = useMemo(() => ({
    data: tableData?.[activeList] || [],
    columns: tabConfigs?.[activeList]?.columns || [],
    filterId: tabConfigs?.[activeList]?.filterId || "name",
    name: tabConfigs?.[activeList]?.name || ""
  }), [activeList, tableData, tabConfigs]);

  const updateIndicatorPosition = useCallback(() => {
    const node = listRefs.current?.[activeList];
    const containerNode = containerRef.current;
    
    if (node && containerNode) {
      const nodeRect = node?.getBoundingClientRect();
      const containerRect = containerNode?.getBoundingClientRect();
      const padding = 8;
      
      setIndicatorStyle({
        left: nodeRect.left - containerRect.left + containerNode.scrollLeft - padding / 2,
        width: nodeRect.width + padding,
      });
    }
  }, [activeList]);

  const handleTabChange = useCallback((index: number) => {
    setActiveList(index);
    dispatch(setTableCurrentId({ value: index }));
  }, [dispatch]);

  useEffect(() => {
    updateIndicatorPosition();
  }, [updateIndicatorPosition]);

  if (activeList === 0 && isConfigCategory) {
    return (
      <Card>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading categories...</div>
        </div>
      </Card>
    );
  }

  if (activeList === 1 && isConfigAttributes) {
    return (
      <Card>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading attributes...</div>
        </div>
      </Card>
    );
  }

  if (activeList === 2 && isConfigTaxes) {
    return (
      <Card>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading taxes...</div>
        </div>
      </Card>
    );
  }

  if (activeList === 3 && isConfigDiscounts) {
    return (
      <Card>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading discounts...</div>
        </div>
      </Card>
    );
  }

  if (activeList === 4 && isConfigCoupons) {
    return (
      <Card>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading coupons...</div>
        </div>
      </Card>
    );
  }

  if (!businessId) {
    return (
      <Card>
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading...</div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="dark:bg-black">
      <div className="flex flex-col gap-y-3">
        <div className="px-6">
          <div 
            ref={containerRef} 
            className="bg-template-whitesmoke-dim dark:bg-black w-fit px-2 rounded-sm relative z-10" 
            style={hiddenScrollbar}
          >
            <div className="flex items-center gap-x-4">
              {tabConfigs.map((tab, index) => (
                <TabList 
                  key={index}
                  item={tab.name} 
                  index={index} 
                  setlistCount={handleTabChange}
                  ref={el => {
                    if (el) listRefs.current[index] = el;
                  }} 
                />
              ))}
            </div>
            <div 
              className="absolute top-1/2 -translate-y-1/2 bg-white dark:bg-template-primary h-[90%] -z-10 transition-all rounded-sm duration-300 ease-in-out" 
              style={{ left: indicatorStyle.left, width: indicatorStyle.width }} 
            />
          </div>
        </div>

        <div className="px-4 py-5 bg-white dark:bg-black rounded-sm">
          <DataTableWithNumberPagination 
            columns={currentTable.columns} 
            data={currentTable.data}
            filterId={currentTable.filterId} 
            placeholderText={`Search by ${currentTable.name}...`}
            isShowCost={false} 
            isShowStock={true} 
            displayedText="Stocks" 
          />
        </div>
      </div>
    </Card>
  );
};

export default ConfigTables;