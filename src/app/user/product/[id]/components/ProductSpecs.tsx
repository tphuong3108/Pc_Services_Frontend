"use client";

interface Product {
  brand: string;
  model: string;
  size: string;
  resolution: string;
  panel: string;
  ports: string[];
}

export default function ProductSpecs({ product }: { product: Product }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Thông số kỹ thuật</h2>
        <button className="text-blue-600 text-sm hover:underline">Mở rộng</button>
      </div>
      <div className="border rounded-lg p-4 bg-gray-50">
        <dl className="divide-y divide-gray-200">
          <div className="grid grid-cols-2 py-2">
            <dt className="font-medium text-gray-700">Hãng sản xuất</dt>
            <dd className="text-gray-900">{product.brand}</dd>
          </div>
          <div className="grid grid-cols-2 py-2">
            <dt className="font-medium text-gray-700">Model</dt>
            <dd className="text-gray-900">{product.model}</dd>
          </div>
          <div className="grid grid-cols-2 py-2">
            <dt className="font-medium text-gray-700">Kích thước màn hình</dt>
            <dd className="text-gray-900">{product.size}</dd>
          </div>
          <div className="grid grid-cols-2 py-2">
            <dt className="font-medium text-gray-700">Độ phân giải</dt>
            <dd className="text-gray-900">{product.resolution}</dd>
          </div>
          <div className="grid grid-cols-2 py-2">
            <dt className="font-medium text-gray-700">Tấm nền</dt>
            <dd className="text-gray-900">{product.panel}</dd>
          </div>
          <div className="grid grid-cols-2 py-2">
            <dt className="font-medium text-gray-700">Cổng kết nối</dt>
            <dd className="text-gray-900">{product.ports}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
