import { Overview } from "@/components/dashboard";
import StaffDetails from "@/components/dashboard/staffs/sections/staff-detail";
import { notFound } from "next/navigation";

const StaffView = async ({params}: {params: Promise<{view: Array<string>}>}) => {
    const {view} = await params;


    if (view?.length >= 3) {
        notFound();
    }

    return(
        <Overview>
            <StaffDetails view={view} />
        </Overview>
    );
}

export default StaffView;