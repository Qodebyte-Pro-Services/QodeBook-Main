import { Overview } from "@/components/dashboard";
import { CustomerDetail } from "@/components/dashboard/customers/sections";

const CustomerDetails = async({params}: {params: Promise<{id: string}>}) => {
    const {id} = await params;
    return(
        <Overview>
            <CustomerDetail id={id} />
        </Overview>
    )
}

export default CustomerDetails;