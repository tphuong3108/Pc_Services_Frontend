"use client";

const faqs = [
  {
    q: "Tôi nên chọn Hệ điều hành?",
    a: "Việc lựa chọn hệ điều hành phụ thuộc vào yêu cầu của bạn. Windows: phổ biến, MacOS: cho người sáng tạo, Linux: phù hợp cho người kiểm soát hệ thống nhiều hơn.",
  },
  {
    q: "Máy tính xách tay nào phù hợp với việc học của tôi?",
    a: "Bạn nên chọn máy có cấu hình vừa phải, gọn nhẹ, pin lâu, giá hợp lý.",
  },
  {
    q: "Làm thế nào để chọn được MacBook?",
    a: "Hãy cân nhắc nhu cầu về hiệu năng, màn hình, và khả năng tương thích ứng dụng trước khi chọn.",
  },
];

export default function FAQSection() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Tiêu đề */}
      <h2 className="text-xl font-semibold mb-4">
        Những câu hỏi thường gặp về Dịch vụ sửa chữa
      </h2>

      {/* Danh sách FAQ */}
      <div className="divide-y divide-gray-200">
        {faqs.map((f, i) => (
          <details key={i} className="py-3 group">
            <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-800 hover:text-blue-600">
              {f.q}
              <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <p className="mt-2 text-gray-600 text-sm leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
