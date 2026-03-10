import React from "react";

export default function POSLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-1 h-full overflow-hidden">
                {children}
            </main>
        </div>
    );
}
