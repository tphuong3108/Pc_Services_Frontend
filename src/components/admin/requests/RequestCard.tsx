"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { Request } from "@/types/Request";
import { Service } from "@/types/Service";
import { requestService } from "@/services/request.service";
import { serviceService } from "@/services/service.service";
import RequestDetailModal from "./RequestDetailModal";
import RequestEditModal from "./RequestEditModal";
import { toast } from "react-toastify/unstyled";

interface RequestCardProps {
  req: Request;
  services: { _id: string; name: string }[];
  products: { _id: string; name: string }[];
  setIsModalOpen?: (open: boolean) => void;
  onDeleted?: () => void;
}

export default function RequestCard({ req, services, onDeleted, setIsModalOpen }: RequestCardProps) {
  const [openMenu, setOpenMenu] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [serviceDetail, setServiceDetail] = useState<Service | null>(null);

  const getServiceNameById = (id?: string): string => {
    if (!id) return "Không rõ dịch vụ";
    return services.find((s) => s._id === id)?.name || "Không rõ dịch vụ !!!";
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lấy giá dịch vụ nếu là yêu cầu sửa chữa
  useEffect(() => {
    const fetchServicePrice = async () => {
      if (req.service_id && typeof req.service_id === "string") {
        try {
          const service = await serviceService.getById(req.service_id);
          setServiceDetail(service);
        } catch (error) {
          console.error("❌ Không lấy được giá dịch vụ:", error);
        }
      }
    };

    fetchServicePrice();
  }, [req.service_id]);

  return (
    <>
      {/* Modal chi tiết */}
      {showDetail && req && (
        <RequestDetailModal
          isOpen={showDetail}
          onClose={() => {setShowDetail(false); setIsModalOpen?.(false)}}
          request={req}
          service={serviceDetail}
        />
      )}

      {/* Modal cập nhật */}
      <RequestEditModal
        isOpen={showEdit}
        onClose={() => {setShowEdit(false); setIsModalOpen?.(false)}}
        request={req}
        // products={products}
        // services={serviceDetail}
        onSuccess={onDeleted}
      />

      {/* <div className="bg-white shadow rounded-lg p-4 mb-4 relative break-words w-full"> */}
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="break-words">
          <h3 className="font-semibold text-gray-800 mb-1">
            {req.service_id ? "🔧 Yêu cầu sửa chữa" : "📦 Đơn đặt hàng"}
          </h3>

          {/* Nếu là sửa chữa thì hiện tên dịch vụ */}
          {req.service_id && (
            <p className="text-sm text-gray-500 break-words">
              📌{" "}
              {getServiceNameById(
                typeof req.service_id === "string"
                  ? req.service_id
                  : req.service_id._id
              )}
            </p>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setOpenMenu((prev) => !prev)}>
            <MoreHorizontal className="w-5 h-5 text-gray-500 cursor-pointer" />
          </button>

          {openMenu && (
            <div className="absolute right-0 z-10 mt-2 w-40 bg-white border rounded shadow-lg py-1 text-sm text-gray-700">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setShowDetail(true);
                  setIsModalOpen?.(true);
                  setOpenMenu(false);
                }}
              >
                🔍 Xem chi tiết
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setShowEdit(true);
                  setIsModalOpen?.(true);
                  setOpenMenu(false);
                }}
              >
                ✏️ Cập nhật
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                onClick={async () => {
                  setOpenMenu(false);
                  try {
                    if (req.service_id) {
                      await requestService.hideRepair(req._id);
                    } else {
                      await requestService.hideOrder(req._id);
                    }
                    onDeleted?.(); // ✅ callback reload danh sách
                  } catch (err) {
                    console.error("❌ Lỗi khi xóa:", err);
                    toast.error("Xóa thất bại");
                  }
                }}
              >
                🗑 Xóa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="text-sm text-gray-700 space-y-2 mb-0 px-3 py-3 pb-2 border rounded-lg bg-gray-50">
        {req.name && (
          <p className="flex items-center gap-2">
            <span className="text-purple-600">👤</span>
            <span className="truncate block max-w-[200px]">{req.name}</span>
          </p>
        )}

        {req.phone && (
          <p className="flex items-center gap-2">
            <span className="text-pink-600">📞</span>
            <span className="truncate block max-w-[200px]">{req.phone}</span>
          </p>
        )}

        {req.address && (
          <p className="flex items-center gap-2">
            <span className="text-red-600">📍</span>
            <span className="truncate block max-w-[200px]">{req.address}</span>
          </p>
        )}

        <p className="flex items-center gap-2 font-semibold">
          <span className="text-yellow-600">💰</span>
          <span className="truncate block max-w-[200px]">
            Tổng tiền:{" "}
            {(req.service_id
              ? (typeof req.service_id === "object"
                ? req.service_id.price ?? 0
                : serviceDetail?.price ?? 0)
              : req.items?.reduce((sum, item) =>
                sum +
                (item.quantity ?? 0) *
                (typeof item.product_id === "object"
                  ? item.product_id.price ?? 0
                  : item.price ?? 0),
                0) ?? 0
            ).toLocaleString()}₫
          </span>
        </p>

        <p className="flex items-center gap-2 text-gray-500 text-sm">
          <span>📅</span>
          <span>{req.updatedAt}</span>
        </p>
      </div>

      {/* </div> */}
    </>
  );
}
