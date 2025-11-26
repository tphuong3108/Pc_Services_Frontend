"use client";

interface ProductDescriptionProps {
  description: string;
}

export default function ProductDescription({ description }: ProductDescriptionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Mô tả</h2>
        <button className="text-blue-600 text-sm hover:underline">Mở rộng</button>
      </div>
      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{description}</p>
    </div>
  );
}
