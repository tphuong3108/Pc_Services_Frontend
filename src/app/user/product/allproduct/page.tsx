"use client";

import dynamic from "next/dynamic";

const AllProductsPageClient = dynamic(() => import("./AllProductsPageClient"), {
  ssr: false,
});

export default function Page() {
  return <AllProductsPageClient />;
}
