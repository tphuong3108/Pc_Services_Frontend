import { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";

export default function Page() {
  return (
    <Suspense fallback={<p className="text-center py-8">Đang tải...</p>}>
      <SearchPageClient />
    </Suspense>
  );
}
