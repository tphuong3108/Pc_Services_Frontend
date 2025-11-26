import { Suspense } from "react";
import UserProductPageClient from "./UserProductPageClient";

export default function Page() {
  return (
    <Suspense fallback={<p>Đang tải...</p>}>
      <UserProductPageClient />
    </Suspense>
  );
}
