"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";

const ErrorBoundary = ({error, reset}: {error: Error; reset: () => void}) => {
    const router = useRouter();
    const handleReload = () => {
        startTransition(() => {
            router.refresh();
            reset();
        })
    };
    return(
        <html>
            <body>
                <div className="flex flex-col gap-y-3">
                    <div className="text-sm font-bold">{error.message}</div>
                    <button onClick={handleReload}>Reload Page</button>
                </div>
            </body>
        </html>
    )
}

export default ErrorBoundary;