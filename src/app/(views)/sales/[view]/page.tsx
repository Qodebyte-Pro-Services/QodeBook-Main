import { Overview } from "@/components/dashboard";
import SalesReportDetails from "@/components/dashboard/sales/report-details";

const SalesViewDetail = async ({params}: {params: Promise<{view: string}>}) => {
    const view = (await params)?.view;
    return(
        <Overview>
            <SalesReportDetails
                id={view}
            />
        </Overview>
    );
}

export default SalesViewDetail;