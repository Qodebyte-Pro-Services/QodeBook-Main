import FinanceContents from "@/components/dashboard/finances/contents";
import { Overview } from "@/components/dashboard";

const FinancesPage = () => {
    return(
        <Overview>
            <FinanceContents />
        </Overview>
    );
};
export default FinancesPage;
