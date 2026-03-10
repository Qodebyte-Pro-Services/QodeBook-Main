"use client";

import React, { useState } from "react";

const useCustomStyles = () => {
    const [customScrollbar] = useState<React.CSSProperties>({
        scrollbarWidth: "thin",
        scrollbarColor: "var(--color-template-primary) var(--color-template-secondary)"
    });

    const [hiddenScrollbar] = useState<React.CSSProperties>({
        scrollbarWidth: "none"
    });

    return {
        customScrollbar,
        hiddenScrollbar
    }
}

export default useCustomStyles;