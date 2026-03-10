import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Variants } from "framer-motion";
import {motion} from "framer-motion";

const StationSettings = ({sectionVariant, isPhoneView}: {sectionVariant: Variants; isPhoneView: boolean;}) => {
    return(
        <motion.div
            key="station"
            variants={sectionVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''}`)}
        >
            <Card>
                <CardHeader className="py-3">
                    <CardTitle>Station</CardTitle>
                    <CardDescription>Manage your station settings here</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="px-2 text-sm font-[450]">No contents for now</div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default StationSettings;