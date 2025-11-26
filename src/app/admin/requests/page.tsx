"use client";

import { useState, useEffect } from "react";
import TableHeader from "@/components/admin/TableHeader";
import RequestBoard from "@/components/admin/requests/RequestBoard";
import { searchRequests, searchHistoryRequests } from "@/services/search.service";
import { requestService } from "@/services/request.service";
import { Request } from "@/types/Request";

export default function RequestsPage() {
  const [query, setQuery] = useState("");
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"service" | "product" | "history">("service");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      let data: Request[] = [];

      if (!query.trim()) {
        if (activeTab === "history") {
          // 🛠 Load mặc định toàn bộ request ẩn + hoàn thành
          const [repairs, orders] = await Promise.all([
            requestService.getAllRepairs(true),
            requestService.getAllOrders(true),
          ]);
          data = [...repairs, ...orders].filter(r => r.hidden === true);
        } else {
          setRequests([]);
          return;
        }
      } else {
        if (activeTab === "history") {
          const searchResults = await searchHistoryRequests(query);
          data = searchResults;
          if (data.length === 0) {
            setRequests([]);
            setSearching(true);
            return;
          }
        } else {
          const searchResults = await searchRequests(query, activeTab);
          data = searchResults.filter(r => r.hidden !== true);
          if (data.length === 0) {
            setRequests([]);
            setSearching(true);
            return;
          }
        }
      }

      setRequests(data);
    } catch (err) {
      console.error("❌ Lỗi khi fetch dữ liệu:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const timeout = setTimeout(fetchData, 300);
  return () => clearTimeout(timeout);
}, [query, activeTab]);

  useEffect(() => {
    setQuery("");
    setRequests([]);
  }, [activeTab]);

  return (
    <div className="p-6 flex-1 w-full">
      <TableHeader
        title="Quản lý yêu cầu khách hàng"
        breadcrumb={["Admin", "Yêu cầu"]}
      />

      <div className="flex space-x-4 border-b w-full max-w-full overflow-x-auto mb-4">
        <button
          className={`pb-2 px-4 font-medium ${
            activeTab === "service"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => {
            setActiveTab("service");
            setSearching(false);
          }}
        >
          Dịch vụ
        </button>
        <button
          className={`pb-2 px-4 font-medium ${
            activeTab === "product"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => {
            setActiveTab("product");
            setSearching(false);
          }}
        >
          Sản phẩm
        </button>
        <button
          className={`pb-2 px-4 font-medium ${
            activeTab === "history"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
          onClick={() => {
            setActiveTab("history");
            setSearching(false);
          }}
        >
          🕓 Lịch sử
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder={
            activeTab === "service"
              ? "Tìm kiếm yêu cầu dịch vụ..."
              : activeTab === "product"
              ? "Tìm kiếm đơn hàng sản phẩm..."
              : "Tìm kiếm trong lịch sử đã ẩn..."
          }
          className="border rounded px-3 py-2 w-full max-w-md"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading && <p className="text-sm text-gray-500">🔄 Đang tìm kiếm...</p>}

      <RequestBoard
        requests={requests}
        tab={activeTab}
        searching={searching}
      />
    </div>
  );
}