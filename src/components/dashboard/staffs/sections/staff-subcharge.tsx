import { DataTableNumberPagination } from "@/components/data-table/data-table-number-pagination";
import { DataTableWithNumberPagination } from "@/components/data-table/data-table-with-numbered-pagination";
import staffSubchargeColumn from "@/components/data-table/staff-subcharge-column";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useState } from "react";
import CreateStaffSubcharges from "../forms/create-staff-subcharges";
import { StaffResponseLogic } from "@/models/types/shared/handlers-type";
import { useQuery } from "@tanstack/react-query";
import { getStaffSubcharges } from "@/api/controllers/get/handler";

export type StaffSubchargeResponse = {
    id: string;
    staff_id: string;
    sub_charge_amt: string;
    business_id: number;
    created_at: string;
    reason: string;
};

const StaffSubcharge = ({staff_details}: {staff_details: StaffResponseLogic}) => {
    const [showSubchargeForm, setShowSubchargeForm] = useState<boolean>(false);

    const details = useMemo(() => {
        if (typeof staff_details === "object" && Object.keys(staff_details)?.length) {
            return staff_details;
        }
        return null;
    }, [staff_details])

    const {data: subchargesdata, isSuccess: subchargesSuccess, isError: subchargesError} = useQuery({
        queryKey: ["get-staff-subcharges", details?.business_id],
        queryFn: () => getStaffSubcharges({staff_id: details?.staff_id || "", businessId: details?.business_id || 0}),
        enabled: details?.business_id !== 0 && details !== null,
        refetchOnWindowFocus: 'always',
        retry: false
    });


    const subcharges = useMemo<Array<StaffSubchargeResponse>>(() => {
        if (subchargesSuccess && !subchargesError && details) {
            return subchargesdata?.staff_subcharges?.map((subs: StaffSubchargeResponse) => ({...subs, ...details}));
        }
        return [];
    }, [details, subchargesdata, subchargesSuccess, subchargesError]);
    
    return(
        <>
            <Card className="dark:bg-black">
                <CardHeader className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                        <CardTitle>Staff Subcharge</CardTitle>
                        <CardDescription>Manage your staff subcharges here</CardDescription>
                    </div>
                    <button onClick={() => setShowSubchargeForm(true)} className="bg-template-primary text-white py-2 px-4 rounded-md text-sm font-[550]">Add Subcharge</button>
                </CardHeader>
                <CardContent>
                    <DataTableWithNumberPagination columns={staffSubchargeColumn} data={subcharges} displayedText="Subcharges" filterId="reason" placeholderText="Filter By Reason" isShowCost={false} isShowStock={true}  />
                </CardContent>
            </Card>
            {showSubchargeForm && (
                <CreateStaffSubcharges
                    staff_details={staff_details}
                    handleFormClose={() => setShowSubchargeForm(false)}
                />
            )}
        </>
    );
}

export default StaffSubcharge;