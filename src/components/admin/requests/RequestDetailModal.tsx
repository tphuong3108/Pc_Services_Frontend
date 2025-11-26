/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import Modal from "@/components/common/Model";
import { Request } from "@/types/Request";
import { Service } from "@/types/Service";
import { useEffect, useRef, useState } from "react";

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
  service?: Service | null;
  setIsModalOpen?: (open: boolean) => void;
}

export default function RequestDetailModal({ isOpen, onClose, request, service, setIsModalOpen }: RequestDetailModalProps) {
  const [serviceName, setServiceName] = useState<string>("Đang tải...");
  const modalRef = useRef<HTMLDivElement>(null); // 👈 ref modal content

  // Đóng khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
        setIsModalOpen?.(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, setIsModalOpen]);

  useEffect(() => {
    if (!isOpen || !request) return;
    if (!service) {
      service = request.service_id as Service;
    } else {
      setServiceName(service.name);
    }
  }, [request, isOpen]);

  useEffect(() => {
    if (request?.service_id && service) {
      setServiceName(service.name);
    } else {
      setServiceName("Không rõ dịch vụ");
    }
  }, [request?.service_id, service]);

  if (!request) return null;

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); setIsModalOpen?.(false); }}>
      <div ref={modalRef}> {/* 👈 gắn vào đây */}
        <h2 className="text-xl font-bold mb-4">📄 Chi tiết yêu cầu</h2>

        <div className="text-sm space-y-2">
          {request.name && <p>👤 <strong>Tên:</strong> {request.name}</p>}
          {request.email && <p>📧 <strong>Email:</strong> {request.email}</p>}
          {request.phone && <p>📞 <strong>SĐT:</strong> {request.phone}</p>}
          {request.address && <p>📍 <strong>Địa chỉ:</strong> {request.address}</p>}

          {request.service_id ? (
            <>
              <h3 className="font-semibold text-blue-600 mt-4">🛠 Yêu cầu sửa chữa</h3>
              <p>🔧 <strong>Dịch vụ:</strong> {serviceName}</p>
              {request.problem_description && (
                <p>📋 <strong>Vấn đề:</strong> {request.problem_description}</p>
              )}
              {Array.isArray(request.images) && request.images.length > 0 && (
                <div>
                  <strong>🖼 Ảnh đính kèm:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {request.images.map((img, i) => (
                      <img
                        key={i}
                        src={img.url}
                        alt={`Ảnh ${i + 1}`}
                        className="w-24 h-24 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <h3 className="font-semibold text-green-600 mt-4">📦 Đơn đặt hàng</h3>
              {Array.isArray(request.items) && request.items.length > 0 && (
                <ul className="list-disc list-inside text-gray-700">
                  {request.items.map((item, index) => (
                    <li key={index}>
                      {item.product_id.name}: {item.quantity} x {item.product_id.price}₫
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          <p>📌 <strong>Trạng thái:</strong> {
            request.status === "new"
              ? "Mới"
              : request.status === "in_progress"
                ? "Đang xử lý"
                : request.status === "completed"
                  ? "Hoàn thành"
                  : request.status
          }</p>
          <p>⏰ <strong>Cập nhật:</strong> {request.updatedAt}</p>
        </div>
      </div>
    </Modal>
  );
}
