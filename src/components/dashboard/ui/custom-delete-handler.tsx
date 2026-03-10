import { useCustomDeleteHandler } from "@/store/state/lib/ui-state-manager";
import {motion} from "framer-motion";
import { Trash2 } from "lucide-react";
import { useMemo } from "react";

const CustomDeleteHandler = ({
    closeToast,
    onConfirm,
    onCancel,
}: {
    closeToast: (prm?: string) => void;
    onConfirm?: () => void | Promise<void>;
    onCancel?: () => void;
}) => {
    const {title} = useCustomDeleteHandler();
    const customTitle = useMemo<string>(() => {
        return title;
    }, [title]);
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="w-full max-w-sm bg-white rounded-md shadow-md p-4"
        >
            <div className="flex items-start gap-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-100">
                    <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex flex-col">
                    <div className="text-sm font-semibold text-gray-900">Delete {customTitle}?</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                        This action cannot be undone. All related data will be permanently removed.
                    </div>
                </div>
            </div>
            <div className="mt-4 flex items-center gap-x-3">
                <motion.button
                    initial={{ scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center rounded-md bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 transition"
                    onClick={async () => {
                        try {
                            await onConfirm?.();
                        } finally {
                            closeToast('confirm');
                        }
                    }}
                >
                    Confirm delete
                </motion.button>
                <motion.button
                    initial={{ scale: 1 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center rounded-md px-3.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 transition"
                    onClick={() => {
                        onCancel?.();
                        closeToast('');
                    }}
                >
                    Cancel
                </motion.button>
            </div>
        </motion.div>
    );
};

export default CustomDeleteHandler;