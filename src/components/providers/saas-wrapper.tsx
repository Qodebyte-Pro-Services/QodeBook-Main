"use client";

import { DefaultType } from "@/models/types/shared/project-type";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const SaasWrapper = ({ children }: DefaultType) => {
  return <>{children}</>;
};

export default SaasWrapper;