/* eslint-disable prefer-const */
"use client";

import { useEffect, useState } from "react";
import { Edit, Trash, Eye, ChevronRight, ChevronLeft } from "lucide-react";
import TableHeader from "@/components/admin/TableHeader";
import Button from "@/components/common/Button";
import { serviceService } from "@/services/service.service";
import { searchServices } from "@/services/search.service";
import { categoryServiceService } from "@/services/categoryservice.service";
import { discountService } from "@/services/discount.service";
import { Service } from "@/types/Service";
import { CategoryService } from "@/types/CategoryService";
import { toast } from "react-toastify";
import { showConfirmToast } from "@/components/common/ConfirmToast";
import Modal from "./Modal";
import ServiceForm from "./ServiceForm";

export default function ServicesTable() {
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<CategoryService[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [query, setQuery] = useState("");
    const [discounts, setDiscounts] = useState<Record<string, number>>({}); // 🟢 thêm
    const [discountDates, setDiscountDates] = useState<Record<string, { start: Date; end: Date }>>({});

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalServices, setTotalServices] = useState(0);

    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const displayedServices = services

    useEffect(() => {
        const updateItemsPerPage = () => {
            setItemsPerPage(window.innerWidth < 1024 ? 5 : 10);
        };
        updateItemsPerPage();
        window.addEventListener("resize", updateItemsPerPage);
        return () => window.removeEventListener("resize", updateItemsPerPage);
    }, []);

    const fetchServices = async () => {
        try {
            const res = await serviceService.getAll(itemsPerPage, currentPage); // ✅ Gọi đúng limit + page
            const serviceList = res.services || [];

            const discountMap: Record<string, number> = {};
            const discountDatesMap: Record<string, { start: Date; end: Date }> = {};

            await Promise.all(
                serviceList.map(async (s) => {
                    const discount = await discountService.getDiscountById('service', s._id);
                    if (discount) {
                        discountMap[s._id] = discount.sale_off;
                        discountDatesMap[s._id] = {
                            start: new Date(discount.start_date),
                            end: new Date(discount.end_date),
                        };
                    }
                })
            );

            setServices(serviceList);
            setDiscounts(discountMap);
            setDiscountDates(discountDatesMap);
            setTotalPages(res.totalPages);          // ✅ lấy từ API
            setTotalServices(res.total);            // ✅ dùng cho dòng "hiển thị x-y trên z"
        } catch (err) {
            console.error("Lỗi khi tải dịch vụ:", err);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await categoryServiceService.getAll();
            setCategories(data);
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
        }
    };

    useEffect(() => {
        Promise.all([fetchServices(), fetchCategories()]).finally(() =>
            setLoading(false)
        );
    }, []);

    useEffect(() => {
        fetchServices();
    }, [currentPage, itemsPerPage]);

    const handleAdd = () => {
        setEditingService(null);
        setModalOpen(true);
    };


    const handleEdit = (service: Service) => {
        setEditingService(service);
        setModalOpen(true);
    };


    const handleDelete = async (id: string) => {
        const confirmed = await showConfirmToast({
            message: "Bạn có chắc muốn xóa dịch vụ này?",
            confirmText: "Xóa",
            cancelText: "Hủy",
        });
        if (!confirmed) return;


        const toastId = toast.loading("Đang xóa dịch vụ...");
        try {
            await serviceService.delete(id);
            await fetchServices();
            toast.update(toastId, {
                render: "Đã xóa thành công",
                type: "success",
                isLoading: false,
                autoClose: 2000,
            });
        } catch (err) {
            toast.update(toastId, {
                render: "Xóa thất bại",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        }
    };


    const handleSubmit = async (data: FormData & { category_id: string }) => {
        if (isSubmitting) return;


        const maxSize = 2 * 1024 * 1024;
        const files = data.getAll("images") as File[];
        for (let file of files) {
            if (file.size > maxSize) {
                toast.error(`Ảnh "${file.name}" vượt quá 2MB, vui lòng chọn ảnh khác.`);
                return;
            }
        }


        const toastId = toast.loading(
            editingService ? "Đang cập nhật..." : "Đang tạo dịch vụ..."
        );


        try {
            setIsSubmitting(true);
            if (editingService) {
                await serviceService.update(editingService._id, data);
                toast.update(toastId, {
                    render: "Cập nhật thành công",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                });
            } else {
                await serviceService.create(data);
                toast.update(toastId, {
                    render: "Tạo dịch vụ thành công",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                });
            }
            setModalOpen(false);
            await fetchServices();
        } catch (err) {
            console.error("Lỗi khi lưu dịch vụ:", err);
            toast.update(toastId, {
                render: "Lỗi khi lưu dịch vụ",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    //excel export
    const handleExport = async () => {
        try {
            const res = await serviceService.exportServicesToExcel();
            const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `Danh_sach_dich_vu_${new Date().toISOString().split("T")[0]}.xlsx`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed', error);
        }
    };


    const getPaginationRange = (
        totalPages: number,
        currentPage: number,
        siblingCount = 1
    ): (number | string)[] => {
        const totalPageNumbers = siblingCount * 2 + 5;
        if (totalPages <= totalPageNumbers) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const leftSibling = Math.max(currentPage - siblingCount, 1);
        const rightSibling = Math.min(currentPage + siblingCount, totalPages);
        const shouldShowLeftDots = leftSibling > 2;
        const shouldShowRightDots = rightSibling < totalPages - 2;
        const firstPage = 1;
        const lastPage = totalPages;
        if (!shouldShowLeftDots && shouldShowRightDots) {
            const range = [...Array(3 + siblingCount * 2)].map((_, i) => i + 1);
            return [...range, "...", lastPage];
        }
        if (shouldShowLeftDots && !shouldShowRightDots) {
            const range = [...Array(3 + siblingCount * 2)].map(
                (_, i) => totalPages - (2 + siblingCount * 2) + i
            );
            return [firstPage, "...", ...range];
        }
        if (shouldShowLeftDots && shouldShowRightDots) {
            const range = Array.from(
                { length: rightSibling - leftSibling + 1 },
                (_, i) => leftSibling + i
            );
            return [firstPage, "...", ...range, "...", lastPage];
        }
        return [];
    };

    const handleSearch = async (value: string) => {
        setQuery(value);
        setCurrentPage(1);
        if (value.trim() === "") {
            fetchServices();
        } else {
            const results = await searchServices(value);
            setServices(results);
        }
    };

    if (loading) return <p className="p-4">Đang tải dữ liệu...</p>;

    return (
        <div className="bg-white shadow rounded p-4">
            <TableHeader
                title="Quản lý dịch vụ sửa chữa"
                breadcrumb={["Admin", "Dịch vụ"]}
                actions={
                    <>
                        <Button variant="secondary" onClick={handleExport}>📤 Xuất file</Button>
                        <Button variant="primary" onClick={handleAdd}>
                            + Thêm dịch vụ
                        </Button>
                    </>
                }
            />

            <div className="my-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm dịch vụ..."
                    className="border px-3 py-2 rounded w-full max-w-xs"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            {/* Table for desktop */}
            <table className="w-full text-left border-collapse hidden lg:table mt-4">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2"><input type="checkbox" /></th>
                        <th className="p-2 text-center">Tên dịch vụ</th>
                        <th className="p-2 text-center">Giá gốc</th>
                        <th className="p-2 text-center">Giảm giá</th>
                        <th className="p-2 text-center">Giá sau khi giảm</th>
                        <th className="p-2 text-center">Danh mục</th>
                        <th className="p-2 text-center">Trạng thái</th>
                        <th className="p-2 text-center">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedServices.map((s) => {
                        const discountPercent = discounts[s._id] || 0;
                        const finalPrice = s.price - (s.price * discountPercent) / 100;
                        const start_date = discounts[s._id]

                        return (
                            <tr key={s._id} className="border-b hover:bg-gray-50">
                                <td className="p-2"><input type="checkbox" /></td>
                                <td className="p-2 text-center">{s.name}</td>
                                <td className="p-2 text-center">{s.price.toLocaleString()} đ</td>
                                <td className="p-2 text-center">
                                    {(() => {
                                        const sale_off = discounts[s._id];
                                        const dates = discountDates[s._id];
                                        if (sale_off === undefined || !dates?.start || !dates?.end) return "—";

                                        const now = new Date();
                                        const isActive = dates.start <= now && now <= dates.end;
                                        const isUpcoming = now < dates.start;

                                        if (isActive) {
                                            return <span className="text-green-600 font-medium">{sale_off}% đang</span>;
                                        } else if (isUpcoming) {
                                            return <span className="text-yellow-500 italic">{sale_off}% sắp</span>;
                                        } else {
                                            return <span className="text-gray-400">{sale_off}% hết hạn</span>;
                                        }
                                    })()}
                                </td>
                                <td className="p-2 text-center">
                                    {discountPercent > 0
                                        ? `${finalPrice.toLocaleString()} đ`
                                        : `${s.price.toLocaleString()} đ`}
                                </td>

                                <td className="p-2 text-center">
                                    {typeof s.category_id === "string"
                                        ? "Chưa có"
                                        : s.category_id?.name || "Chưa có"}
                                </td>

                                <td className="p-2 text-center">
                                    <span
                                        className={`px-2 py-1 rounded text-sm ${s.status === "active"
                                            ? "bg-green-100 text-green-600"
                                            : s.status === "inactive"
                                                ? "bg-yellow-100 text-yellow-600"
                                                : "bg-red-100 text-red-600"
                                            }`}
                                    >
                                        {s.status === "active"
                                            ? "Đã mở"
                                            : s.status === "inactive"
                                                ? "Tạm ngừng"
                                                : "Đã ẩn"}
                                    </span>
                                </td>

                                <td className="p-2 flex gap-2 justify-center items-center">
                                    <Eye
                                        className="w-4 h-4 cursor-pointer text-blue-600"
                                        onClick={() => {
                                            try {
                                                if (typeof window !== "undefined") {
                                                    const newWindow = window.open(
                                                        `/user/service/detail/${s.slug}`,
                                                        "_blank"
                                                    );
                                                    if (!newWindow) {
                                                        alert("Trình duyệt đã chặn cửa sổ mới. Vui lòng cho phép popup!");
                                                    }
                                                }
                                            } catch (err) {
                                                alert("Không thể mở trang chi tiết sản phẩm.");
                                            }
                                        }}
                                    />
                                    <Edit
                                        className="w-4 h-4 cursor-pointer text-yellow-600"
                                        onClick={() => handleEdit(s)}
                                    />
                                    <Trash
                                        className="w-4 h-4 cursor-pointer text-red-600"
                                        onClick={() => handleDelete(s._id)}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>

            </table>

            {/* Responsive cards for mobile */}
            <div className="lg:hidden space-y-4 mt-4">
                {displayedServices.map((s) => (
                    <div key={s._id} className="border rounded p-4 shadow-sm">
                        <p><strong>Tên:</strong> {s.name}</p>
                        <p><strong>Mô tả:</strong> {s.description}</p>
                        <p><strong>Giá:</strong> {s.price.toLocaleString()} đ</p>
                        <p><strong>Danh mục:</strong> {typeof s.category_id === "string" ? "Chưa có" : s.category_id?.name}</p>
                        <p className="flex items-center gap-2">
                            <strong>Trạng thái:</strong>
                            <span className={`px-2 py-1 rounded text-sm ${s.status === "active"
                                ? "bg-green-100 text-green-600"
                                : s.status === "inactive"
                                    ? "bg-yellow-100 text-yellow-600"
                                    : "bg-red-100 text-red-600"
                                }`}>
                                {s.status === "active"
                                    ? "Đã mở"
                                    : s.status === "inactive"
                                        ? "Tạm ngừng"
                                        : "Đã ẩn"}
                            </span>
                        </p>
                        <div className="flex gap-4 pt-2">
                            <Eye className="w-4 h-4 cursor-pointer text-blue-600"
                                onClick={() => {
                                    try {
                                        if (typeof window !== "undefined") {
                                            const newWindow = window.open(`/user/service/detail/${s.slug}`, "_blank");
                                            if (!newWindow) {
                                                alert("Trình duyệt đã chặn cửa sổ mới. Vui lòng cho phép popup!");
                                            }
                                        }
                                    } catch (err) {
                                        alert("Không thể mở trang chi tiết sản phẩm.");
                                    }
                                }}
                            />
                            <Edit className="w-4 h-4 cursor-pointer text-yellow-600" onClick={() => handleEdit(s)} />
                            <Trash className="w-4 h-4 cursor-pointer text-red-600" onClick={() => handleDelete(s._id)} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal form */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingService ? "Sửa dịch vụ" : "Thêm dịch vụ"}
            >
                <ServiceForm
                    isSubmitting={isSubmitting}
                    initialData={editingService || undefined}
                    categories={categories}
                    onSubmit={handleSubmit}
                    fetchServices={fetchServices} // ✅ phải thêm

                    onCancel={() => setModalOpen(false)}
                />
            </Modal>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
                {/* Left: Trang x / y */}
                <p className="text-sm text-gray-700">
                    Trang {currentPage} / {totalPages}
                </p>

                {/* Right: Pagination controls */}
                <div className="flex items-center gap-1 ml-auto">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {getPaginationRange(totalPages, currentPage).map((page, i) => (
                        <button
                            key={i}
                            onClick={() => typeof page === "number" && setCurrentPage(page)}
                            disabled={page === "..."}
                            className={`w-8 h-8 text-sm flex items-center justify-center rounded-md
                ${page === currentPage ? "text-blue-600 underline font-semibold" : "text-gray-800 hover:bg-gray-100"}
                ${page === "..." ? "cursor-default text-gray-400" : ""}`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
            <p className="text-sm text-center text-gray-500 mt-2">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1}
                -
                {Math.min(currentPage * itemsPerPage, services.length)}
                {" "}trong {services.length} dịch vụ
            </p>
        </div>
    );
}