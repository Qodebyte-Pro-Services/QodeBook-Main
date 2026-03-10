"use client";

import Overview from "@/components/dashboard/overview";
import SalesContent from "@/components/dashboard/sales/content";
import { use, useState } from "react";

export default function Sales({searchParams}: {searchParams: Promise<string>}) {
  const [isPOSActive, setIsPOSActive] = useState(false);
  const search_param = use(searchParams);

  return(
    <Overview isFullWidth={isPOSActive}>
      <SalesContent onPOSStateChange={setIsPOSActive} />
    </Overview>
  )
}