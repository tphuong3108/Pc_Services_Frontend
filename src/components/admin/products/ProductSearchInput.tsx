// components/admin/products/ProductSearchInput.tsx
import React, { useEffect, useState } from "react";

type ProductSearchInputProps = {
  query: string;
  onChange: (value: string) => void; // khớp với Wrapper
  placeholder?: string;
  debounceMs?: number;
};

export default function ProductSearchInput({
  query,
  onChange,
  placeholder = "Tìm kiếm sản phẩm...",
  debounceMs = 300,
}: ProductSearchInputProps) {
  const [local, setLocal] = useState(query);

  // đồng bộ lại khi query bên ngoài thay đổi (ví dụ: clear)
  useEffect(() => setLocal(query), [query]);

  // debounce đổi giá trị gửi ra ngoài -> cập nhật searchQuery trong Wrapper
  useEffect(() => {
    const t = setTimeout(() => onChange(local), debounceMs);
    return () => clearTimeout(t);
  }, [local, onChange, debounceMs]);

  return (
    <div className="my-4 flex items-center gap-2">
      <input
        type="text"
        className="border px-3 py-2 rounded w-full max-w-xs"
        placeholder={placeholder}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
      />
      {local && (
        <button
          type="button"
          className="text-sm px-2 py-1 rounded bg-gray-100"
          onClick={() => setLocal("")}
          aria-label="Xóa tìm kiếm"
        >
          Xóa
        </button>
      )}
    </div>
  );
}
