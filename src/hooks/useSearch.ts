import { useState } from "react";
import { searchProducts } from "@/services/search.service";
import { useRouter } from "next/navigation";
import { Product } from "@/types/Product";

export function useSearch() {
  const router = useRouter();

  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    router.push(`/user/search?query=${encodeURIComponent(query)}`);
    setLoading(true);
    setError("");

    try {
      const res = await searchProducts(query);
      setResults(res.products);
    } catch (err) {
      setError("Lỗi tìm kiếm");
    } finally {
      setLoading(false);
    }
  };

  return { handleSearch, results, loading, error };
}
