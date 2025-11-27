"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const AllProductsPageClient = dynamic(
  () => import("./AllProductsPageClient"),
  { ssr: false }
);

export default function Page() {
  return (
    <Suspense fallback={<p className="text-center py-10">Loading...</p>}>
      <AllProductsPageClient />
    </Suspense>
  );
}
