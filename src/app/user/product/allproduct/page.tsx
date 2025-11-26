import { Suspense } from "react";
import AllProductsPageClient from "./AllProductsPageClient";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-center py-10">Đang tải sản phẩm...</p>}>
      <AllProductsPageClient />
    </Suspense>
  );
}
