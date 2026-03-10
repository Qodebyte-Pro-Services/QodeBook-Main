import { Overview } from "@/components/dashboard";
import SalesInvoiceSystem from "@/components/dashboard/sales/invoice/sale-report-invoice";

const SalesViewDetail = async ({params}: {params: Promise<{view: string}>}) => {
    const view = (await params)?.view;
    return(
        <Overview>
            <SalesInvoiceSystem
                id={view}
            />
        </Overview>
    );
}

export default SalesViewDetail;