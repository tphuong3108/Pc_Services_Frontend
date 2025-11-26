"use client";

import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Request } from "@/types/Request";
import { requestService } from "@/services/request.service";
import { serviceService } from "@/services/service.service";
import { userService } from "@/services/user.service";
import RequestCard from "./RequestCard";
import { productService } from "@/services/product.service";
import { infoService } from "@/services/info.services";
import { Info } from "@/types/Info";
import { toast } from "react-toastify/unstyled";

interface Column {
  id: string;
  title: string;
  requests: Request[];
}

export default function RequestBoard({
  requests,
  tab,
  searching
}: {
  requests: Request[];
  tab: "service" | "product" | "history";
  searching: boolean;
}) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [services, setServices] = useState<{ _id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ _id: string; name: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [info, setInfo] = useState<Info>({} as Info);
  
  useEffect(() => {
    const loadInfo = async () => {
      try {
        const data = await infoService.getInfo();
        setInfo(data);
      } catch (err) {
        console.error("❌ Lỗi khi tải thông tin cửa hàng:", err);
      }
    };
    loadInfo();
  }, []);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = (await serviceService.getAll(50, 1)).services;
        setServices(data.map((s) => ({ _id: s._id, name: s.name })));
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách dịch vụ:", err);
      }
    };
    if (tab === "service") {
      loadServices();
    }
  }, [tab]);

  function mapRequestsToColumns(requests: Request[]): Column[] {
    const columns: Column[] = [
      {
        id: "new",
        title:
          tab === "history" ? "❌ Đã ẩn (Mới)" : "🆕 Mới",
        requests: [],
      },
      {
        id: "in_progress",
        title:
          tab === "history" ? "❌ Đã ẩn (Đang xử lý)" : "⚙️ Đang xử lý",
        requests: [],
      },
      {
        id: "completed",
        title:
          tab === "history" ? "❌ Đã ẩn (Hoàn thành)" : "✅ Hoàn thành",
        requests: [],
      },
    ];

    for (const req of requests) {
      const col = columns.find((c) => c.id === req.status);
      if (col) {
        col.requests.push({
          _id: req._id,
          name: req.name,
          problem_description:
            req.problem_description ?? req.items?.[0]?.name ?? "",
          updatedAt: new Date(req.updatedAt).toLocaleDateString("vi-VN"),
          phone: req.phone,
          address: req.address,
          email: req.email,
          items: req.items,
          service_id: req.service_id,
          images: req.images,
          estimated_time: "",
          status: req.status,
          createdAt: new Date(req.createdAt).toLocaleDateString("vi-VN"),
          hidden: req.hidden,
        });
      }
    }

    return columns;
  }

  useEffect(() => {
    const load = async () => {
      let data: Request[] = [];

      if (requests.length > 0) {
        data = requests;
      } else {
        if (searching) {
          setColumns([]);
          toast.error("Không tìm thấy yêu cầu phù hợp.");
          return;
        }
        if (tab === "service") {
          data = (await requestService.getAllRepairs()).filter(
            (r) => r.hidden !== true
          );
        } else if (tab === "product") {
          data = (await requestService.getAllOrders()).filter(
            (r) => r.hidden !== true
          );
        } else if (tab === "history") {
          const [repairs, orders] = await Promise.all([
            requestService.getAllRepairs(),
            requestService.getAllOrders(),
          ]);
          data = [...repairs, ...orders].filter((r) => r.hidden === true);
        }
      }
      const cols = mapRequestsToColumns(data);
      setColumns(cols);
    };

    load();
  }, [requests, tab]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    const allowedMoves: Record<string, string[]> = {
      new: ["in_progress", "completed"],
      in_progress: ["completed"],
      completed: [],
    };

    if (
      !allowedMoves[source.droppableId]?.includes(destination.droppableId)
    ) {
      toast.error("Không thể chuyển yêu cầu sang trạng thái này!");
      return;
    }

    const updatedColumns = [...columns];
    const sourceCol = updatedColumns.find(
      (col) => col.id === source.droppableId
    )!;
    const destCol = updatedColumns.find(
      (col) => col.id === destination.droppableId
    )!;

    const [movedRequest] = sourceCol.requests.splice(source.index, 1);
    destCol.requests.splice(destination.index, 0, movedRequest);
    setColumns(updatedColumns);

    try {
      if (tab === "service") {
        await requestService.updateRepair(String(movedRequest._id), {
          status: destCol.id as Request["status"],
          images: movedRequest.images,
        });

        if (destCol.id === "completed" && movedRequest._id) {
          if (movedRequest.email) {
            try {
              await userService.sendEmail(
                movedRequest.email,
                "Yêu cầu của bạn đã được hoàn thành",
                `Xin chào ${movedRequest.name || "khách hàng"},
                Yêu cầu của bạn với mã <strong>${movedRequest._id}</strong> đã được hoàn thành. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!`
              );
              await userService.sendEmail(
                info.email,
                `Yêu cầu ${movedRequest._id} đã hoàn thành`,
                `Yêu cầu sửa chữa với mã ${movedRequest._id} đã được hoàn thành.`
              );
            } catch (err) {
              console.error("❌ Lỗi khi gửi email hoàn thành:", err);
            }
          }
        }
      } else if (tab === "product") {
        await requestService.updateOrder(String(movedRequest._id), {
          status: destCol.id as Request["status"],
        });

        if (destCol.id === "completed" && movedRequest.items) {
          for (const item of movedRequest.items) {
            if (typeof item.product_id._id === "string") {
              const prod = await productService.getById(item.product_id._id);
              const newStock = (prod.quantity || 0) - (item.quantity || 1);
              if (newStock === 0) {
                await productService.updateStatus(
                  item.product_id._id,
                  "out_of_stock"
                );
              }
            }
          }
          if (movedRequest.email) {
            try {
              await userService.sendEmail(
                movedRequest.email,
                "Yêu cầu của bạn đã được hoàn thành",
                `Xin chào ${movedRequest.name || "khách hàng"},
                Yêu cầu của bạn với mã ${movedRequest._id} đã được hoàn thành.`
              );
              await userService.sendEmail(
                info.email,
                `Yêu cầu ${movedRequest._id} đã hoàn thành`,
                `Yêu cầu đơn hàng với mã ${movedRequest._id} đã được hoàn thành.`
              );
            } catch (err) {
              console.error("❌ Lỗi khi gửi email hoàn thành:", err);
            }
          }
        }
      }
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật trạng thái:", err);
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen w-full">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">
        📋 Bảng quản lý yêu cầu khách hàng
      </h2>

      <DragDropContext
        onDragEnd={(result) => {
          if (!isModalOpen) {
            handleDragEnd(result);
          }
        }}
      >
        <div className="flex flex-col md:grid md:grid-cols-1 lg:flex lg:flex-row gap-8 items-center lg:items-start">
          {columns.map((col) => (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`w-full lg:w-[32%] max-w-2xl p-4 rounded-xl shadow-md bg-white transition-all ${snapshot.isDraggingOver ? "bg-blue-50" : ""
                    }`}
                >
                  <h3 className="text-lg font-semibold mb-4">{col.title}</h3>
                  <div className="flex flex-col items-center gap-4">
                    {col.requests.map((req, index) => (
                      <Draggable
                        key={String(req._id)}
                        draggableId={String(req._id)}
                        index={index}
                        isDragDisabled={isModalOpen} // ✅ Chặn kéo khi modal mở
                      >

                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`w-full max-w-md border rounded-lg shadow-sm bg-gray-50 p-3 transition ${snapshot.isDragging
                              ? "bg-blue-100 border-blue-400"
                              : "hover:bg-gray-100"
                              }`}
                          >
                            <RequestCard
                              req={{
                                _id: String(req._id),
                                name: req.name || "Khách hàng",
                                problem_description:
                                req.problem_description || req.note || "Không có mô tả",
                                phone: req.phone || "",
                                address: req.address || "",
                                email: req.email || "",
                                items: req.items,
                                service_id: req.service_id,
                                updatedAt: req.updatedAt,
                                createdAt: req.createdAt,
                                estimated_time: "",
                                status: col.id as Request["status"],
                                images: req.images || [],
                              }}
                              services={services}
                              products={products}
                              onDeleted={async () => {
                                const updated =
                                  tab === "service"
                                    ? (await requestService.getAllRepairs()).filter(r => r.hidden !== true)
                                    : tab === "product"
                                      ? (await requestService.getAllOrders()).filter(r => r.hidden !== true)
                                      : (await Promise.all([
                                        requestService.getAllRepairs(),
                                        requestService.getAllOrders()
                                      ])).flat().filter(r => r.hidden === true);
                                setColumns(mapRequestsToColumns(updated));
                              }}
                              setIsModalOpen={setIsModalOpen}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
