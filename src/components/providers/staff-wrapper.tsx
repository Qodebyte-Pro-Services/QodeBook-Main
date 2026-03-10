"use client";

import { useEffect, useMemo } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { DefaultType } from "@/models/types/shared/project-type";

const ProtectedStaffWrapper = ({ children }: DefaultType) => {
    const router = useRouter();
    const isStaffTokenExist = useMemo(() => {
        if (typeof window === "undefined") return;
        const staffToken = Cookies.get("authToken");
        if (!staffToken) return false;
        return true;
    }, []);

    useEffect(() => {
        if (isStaffTokenExist) {
            router.replace("/");
        }
    }, [isStaffTokenExist, router]);

    return children;
}

export default ProtectedStaffWrapper;