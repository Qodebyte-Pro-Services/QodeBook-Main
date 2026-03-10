import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RxCross2 } from "react-icons/rx";

// Type definitions
interface VariantCombination {
    id: string;
    attributes: Record<string, string>;
    price: string;
    costPrice?: string;
    quantity: string;
    sku: string;
    weight: string;
    images: Array<{
        name: string;
        file: File | null;
        preview: string;
        url: string | null;
        id: string | null;
        error: string | null;
        status: 'idle' | 'pending' | 'success' | 'error';
        isMain?: boolean;
    }>;
}

interface VariantPricingTableProps {
    combinations: VariantCombination[];
    setCombinations: React.Dispatch<React.SetStateAction<VariantCombination[]>>;
    basePrice: string;
}

export default function VariantPricingTable({ 
    combinations, 
    setCombinations, 
    basePrice 
}: VariantPricingTableProps) {
    const handleCombinationChange = (id: string, field: keyof VariantCombination, value: string) => {
        const newCombinations = combinations.map(c => {
            if (c.id === id) {
                const processedValue = (field === 'price' || field === 'costPrice' || field === 'quantity') ? value.replace(/[^\d]/g, '') : value;
                return { ...c, [field]: processedValue };
            }
            return c;
        });
        setCombinations(newCombinations);
    };

    const handleRemoveCombination = (id: string) => {
        setCombinations(prev => prev.filter(c => c.id !== id));
    };

    if (combinations.length === 0) return null;

    return (
        <div className="flex flex-col gap-4 p-4 border rounded-md bg-white mt-4">
            <h3 className="font-medium">Variant Pricing & Stock</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-1 py-3"><span className="sr-only">Remove</span></th>
                            <th scope="col" className="px-6 py-3">Variant</th>
                            <th scope="col" className="px-6 py-3">Cost Price (₦)</th>
                            <th scope="col" className="px-6 py-3">Selling Price (₦)</th>
                            <th scope="col" className="px-6 py-3">Quantity</th>
                            <th scope="col" className="px-6 py-3">Threshold</th>
                            <th scope="col" className="px-6 py-3">SKU</th>
                        </tr>
                    </thead>
                    <tbody>
                        {combinations.map((combo: VariantCombination) => (
                            <tr key={combo.id} className="bg-white border-b">
                                <td className="px-1 py-4">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveCombination(combo.id)}>
                                        <RxCross2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {Object.values(combo.attributes).join(' / ')}
                                </td>
                                <td className="px-6 py-4">
                                    <Input
                                        type="text"
                                        value={combo.costPrice || ''}
                                        onChange={(e) => handleCombinationChange(combo.id, 'costPrice', e.target.value)}
                                        placeholder="Cost price"
                                        className="w-28"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <Input
                                        type="text"
                                        value={combo.price}
                                        onChange={(e) => handleCombinationChange(combo.id, 'price', e.target.value)}
                                        placeholder={`Default: ${basePrice || '...'}`}
                                        className="w-28"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <Input
                                        type="text"
                                        value={combo.quantity}
                                        onChange={(e) => handleCombinationChange(combo.id, 'quantity', e.target.value)}
                                        placeholder="0"
                                        className="w-24"
                                        required
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <Input
                                        type="text"
                                        value={combo.weight}
                                        onChange={(e) => handleCombinationChange(combo.id, 'weight', e.target.value)}
                                        placeholder="Threshold"
                                        className="w-24"
                                        required
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <Input
                                        type="text"
                                        disabled={true}
                                        value={combo.sku}
                                        onChange={(e) => handleCombinationChange(combo.id, 'sku', e.target.value)}
                                        placeholder="Optional SKU"
                                        className="w-32"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}