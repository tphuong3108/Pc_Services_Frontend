"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const UserProductPage = dynamic(
  () => import("./UserProductPageClient"),
  { ssr: false }
);

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <UserProductPage />
    </Suspense>
  );
}
