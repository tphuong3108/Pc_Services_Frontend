"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export default function QuestionsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQ[] = [
    // 🖥️ SẢN PHẨM & BẢO HÀNH
    {
      category: "Sản phẩm & Bảo hành",
      question: "Linh kiện laptop/PC tại cửa hàng có chính hãng không?",
      answer:
        "Tất cả linh kiện được cung cấp đều là hàng chính hãng, có đầy đủ tem, mã QR và chứng nhận từ nhà sản xuất. Chúng tôi cam kết không bán hàng trôi nổi hoặc kém chất lượng.",
    },
    {
      category: "Sản phẩm & Bảo hành",
      question: "Thời gian bảo hành linh kiện là bao lâu?",
      answer:
        "Thời gian bảo hành phụ thuộc vào từng loại sản phẩm: RAM, SSD, HDD, mainboard thường từ 12 đến 36 tháng. Bạn có thể kiểm tra chi tiết trên trang sản phẩm.",
    },
    {
      category: "Sản phẩm & Bảo hành",
      question: "Có hỗ trợ lắp ráp PC theo yêu cầu không?",
      answer:
        "Chúng tôi có dịch vụ build PC theo cấu hình mong muốn. Bạn chỉ cần gửi yêu cầu, đội ngũ kỹ thuật sẽ tư vấn cấu hình tối ưu về hiệu năng và chi phí.",
    },
    {
      category: "Sản phẩm & Bảo hành",
      question: "Làm sao để kiểm tra tình trạng đơn hàng?",
      answer:
        "Bạn có thể vào mục 'Đơn hàng của tôi' trong tài khoản hoặc kiểm tra bằng mã đơn hàng được gửi qua email sau khi thanh toán.",
    },

    // 💳 THANH TOÁN & GIAO HÀNG
    {
      category: "Thanh toán & Giao hàng",
      question: "Có những hình thức thanh toán nào được hỗ trợ?",
      answer:
        "Chúng tôi hỗ trợ thanh toán qua tiền mặt khi nhận hàng (COD), chuyển khoản ngân hàng, và thanh toán trực tuyến qua thẻ VISA/MasterCard.",
    },
    {
      category: "Thanh toán & Giao hàng",
      question: "Phí giao hàng được tính như thế nào?",
      answer:
        "Miễn phí giao hàng nội thành Hồ Chí Minh cho đơn hàng từ 1.000.000đ trở lên. Ngoài ra, chúng tôi hỗ trợ giao hàng toàn quốc với mức phí tính theo đơn vị vận chuyển.",
    },
    {
      category: "Thanh toán & Giao hàng",
      question: "Thời gian giao hàng dự kiến là bao lâu?",
      answer:
        "Đối với khu vực nội thành TP.HCM: 1–2 ngày làm việc. Các tỉnh thành khác: 2–5 ngày tùy khoảng cách và đơn vị vận chuyển.",
    },
    {
      category: "Thanh toán & Giao hàng",
      question: "Có thể hủy đơn hàng sau khi đã đặt không?",
      answer:
        "Bạn có thể hủy đơn hàng trong vòng 2 giờ kể từ khi đặt. Nếu đơn đã chuyển sang trạng thái 'Đang giao hàng', vui lòng liên hệ hotline để được hỗ trợ.",
    },

    // 🔁 CHÍNH SÁCH ĐỔI TRẢ
    {
      category: "Chính sách đổi trả",
      question: "Điều kiện đổi trả sản phẩm là gì?",
      answer:
        "Sản phẩm phải còn nguyên vẹn, không trầy xước, đầy đủ phụ kiện, tem bảo hành và hóa đơn mua hàng. Thời gian đổi trả tối đa là 7 ngày kể từ khi nhận hàng.",
    },
    {
      category: "Chính sách đổi trả",
      question: "Trường hợp nào không được đổi trả?",
      answer:
        "Chúng tôi không chấp nhận đổi trả với các sản phẩm đã qua sử dụng, bị tác động vật lý (rơi, vỡ, cháy nổ) hoặc lỗi do người dùng gây ra.",
    },
    {
      category: "Chính sách đổi trả",
      question: "Thời gian hoàn tiền sau khi đổi trả là bao lâu?",
      answer:
        "Thời gian hoàn tiền dao động từ 3–5 ngày làm việc, tùy theo phương thức thanh toán ban đầu. Chúng tôi sẽ thông báo qua email khi giao dịch hoàn tất.",
    },

    // 🧰 DỊCH VỤ SỬA CHỮA
    {
      category: "Dịch vụ sửa chữa",
      question: "Cửa hàng có nhận sửa mainboard, card đồ họa không?",
      answer:
        "Có. Trung tâm kỹ thuật của chúng tôi nhận kiểm tra và sửa chữa các linh kiện laptop, PC, card đồ họa, màn hình và nhiều thiết bị khác.",
    },
    {
      category: "Dịch vụ sửa chữa",
      question: "Quy trình tiếp nhận và sửa chữa diễn ra như thế nào?",
      answer:
        "1️⃣ Tiếp nhận thiết bị và ghi nhận tình trạng. 2️⃣ Kỹ thuật viên kiểm tra và báo giá. 3️⃣ Khách hàng xác nhận sửa chữa. 4️⃣ Tiến hành sửa. 5️⃣ Giao lại thiết bị kèm biên bản bảo hành.",
    },
    {
      category: "Dịch vụ sửa chữa",
      question: "Có hỗ trợ sửa chữa tại nhà không?",
      answer:
        "Chúng tôi hỗ trợ sửa chữa tại nhà trong phạm vi TP.HCM. Vui lòng liên hệ hotline hoặc đặt lịch trước 24h để sắp xếp kỹ thuật viên.",
    },
    {
      category: "Dịch vụ sửa chữa",
      question: "Thiết bị sau khi sửa có được bảo hành không?",
      answer:
        "Mỗi linh kiện thay thế hoặc dịch vụ sửa chữa đều được bảo hành tối thiểu 30 ngày, tùy theo loại hình dịch vụ và linh kiện sử dụng.",
    },
  ];

  // Tách nhóm theo category
  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">
        ❓ Câu hỏi thường gặp
      </h1>

      {Object.entries(groupedFaqs).map(([category, items], idx) => (
        <div key={idx} className="mb-10">
          <h2 className="text-xl font-semibold mb-4 border-l-4 border-blue-500 pl-3">
            {category}
          </h2>

          <div className="space-y-3">
            {items.map((faq, i) => {
              const isOpen = openIndex === i + idx * 100; // tránh trùng index
              return (
                <div
                  key={i}
                  className="border rounded-lg shadow-sm bg-white overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenIndex(isOpen ? null : i + idx * 100)
                    }
                    className="w-full flex justify-between items-center px-4 py-3 text-left font-medium text-gray-800 hover:bg-gray-50"
                  >
                    {faq.question}
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 py-3 text-gray-600 border-t bg-gray-50 animate-fadeIn">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
