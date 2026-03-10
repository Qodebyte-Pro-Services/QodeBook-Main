import { Overview } from "@/components/dashboard";
import { ProductView } from "@/components/dashboard/inventory/sections";
import { notFound } from "next/navigation";

const ProductViewById = async ({params}: {params: Promise<{id: string[]}>}) => {
    const productId = (await params).id;
    if (productId.length <= 1) {
        notFound();
    }
    
    const binaryToNumber = (binary: string): number => {
        binary.split("").forEach((num: string) => {
            if (Number(num) > 1) {
                notFound();
            }
        });
        return parseInt(binary, 2);
    }

    const productIdHashed = binaryToNumber(productId[0]);

    return(
        <Overview>
            <ProductView id={`${productIdHashed}`} />
        </Overview>
    )
}

export default ProductViewById;