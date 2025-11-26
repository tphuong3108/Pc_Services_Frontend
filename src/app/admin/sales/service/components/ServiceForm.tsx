/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { Service } from "@/types/Service";
import { CategoryService } from "@/types/CategoryService";
import { serviceService } from "@/services/service.service";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { discountService } from "@/services/discount.service";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
type Props = {
    initialData?: Service;
    categories: CategoryService[];
    onSubmit: (data: FormData & { category_id: string }) => Promise<void>;
    onCancel: () => void;
    fetchServices: () => Promise<void>;
    isSubmitting?: boolean;
};

export default function ServiceForm({
    initialData,
    categories,
    onSubmit,
    onCancel,
    fetchServices,
    isSubmitting,
}: Props) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: 0,
        discount: 0,
        type: "at_store" as "at_store" | "at_home", // ✅ ép kiểu
        estimated_time: "",
        status: "active" as "active" | "inactive" | "hidden", // ✅ ép kiểu
        category_id: "",
        images: [] as (File | { url: string; public_id?: string })[],
        start_date: null as Date | null,
        end_date: null as Date | null
    });

    useEffect(() => {
        const fetchDiscount = async () => {
            if (!initialData?._id) return;

            try {
                const res = await discountService.getDiscountById('service', initialData._id);

                if (res) {
                    const now = new Date();
                    const start_date = res.start_date ? new Date(res.start_date) : null;
                    const end_date = res.end_date ? new Date(res.end_date) : null;

                    setForm((prev) => ({
                        ...prev,
                        discount: res.sale_off || 0,
                        start_date: start_date,
                        end_date: end_date,
                    }));

                }
            } catch (err) {
                console.warn("⚠️ Không tìm thấy discount cho dịch vụ này", err);
            }
        };


        if (initialData) {
            setForm((prev) => ({
                ...prev,
                name: initialData.name || "",
                description: initialData.description || "",
                price: initialData.price || 0,
                type: (initialData.type as "at_store" | "at_home") || "at_store",
                estimated_time: initialData.estimated_time || "",
                status: (initialData.status as "active" | "inactive" | "hidden") || "active",
                category_id:
                    typeof initialData.category_id === "string"
                        ? initialData.category_id
                        : initialData.category_id &&
                            typeof initialData.category_id === "object" &&
                            "_id" in initialData.category_id
                            ? (initialData.category_id as { _id: string })._id
                            : "",
                images: initialData.images || [],
            }));

            fetchDiscount();
        }
    }, [initialData]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]:
                name === "price" || name === "discount" ? Number(value) : value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);

        setForm((prev) => {
            const current = prev.images || [];
            if (current.length + newFiles.length > 3) {
                toast("Chỉ được phép upload tối đa 3 ảnh!");
                return { ...prev, images: current.slice(0, 3) };
            }
            return { ...prev, images: [...current, ...newFiles].slice(0, 3) };
        });
    };

    const removeImage = (index: number) => {
        setForm((prev) => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.discount > 0 && (!form.start_date || !form.end_date)) {
            toast.error("Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc cho giảm giá!");
            return;
        }
        if (form.start_date && form.end_date && form.end_date < form.start_date) {
            toast.error("Ngày kết thúc phải lớn hơn ngày bắt đầu!");
            return;
        }

        try {
            let serviceId: string = initialData?._id || "";

            const isAnyNewFile = form.images.some(img => img instanceof File);
            let payload: any;

            if (isAnyNewFile) {
                const formData = new FormData();
                formData.append("name", form.name);
                formData.append("description", form.description);
                formData.append("price", String(form.price));
                formData.append("type", form.type);
                formData.append("estimated_time", form.estimated_time);
                formData.append("status", form.status);
                formData.append("slug", form.name
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, ""));
                formData.append("category_id", form.category_id);

                form.images.forEach(img => {
                    if (img instanceof File) {
                        formData.append("images", img);
                    }
                });

                payload = formData;
            } else {
                payload = {
                    ...form,
                    price: Number(form.price),
                    category_id: form.category_id,
                    slug: form.name
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, "")
                };
            }

            let createdService;
            if (payload instanceof FormData) {
                payload.delete("start_date");
                payload.delete("end_date");
                payload.delete("discount");
            } else {
                delete payload.start_date;
                delete payload.end_date;
                delete payload.discount;
            }
            if (initialData?._id) {
                createdService = await serviceService.update(initialData._id, payload);
                toast.success("✅ Cập nhật dịch vụ thành công!");
                serviceId = initialData._id;
            } else {
                createdService = await serviceService.create(payload);
                toast.success("✅ Tạo dịch vụ thành công!");
                serviceId = createdService._id;
            }

            if (form.discount > 0) {
                if (initialData?._id) {
                    await discountService.updateDiscount('service', serviceId, {
                        sale_off: form.discount,
                        start_date: form.start_date!,
                        end_date: form.end_date!,
                    });
                    toast.success("✅ Cập nhật giảm giá dịch vụ thành công!");
                } else {
                    await discountService.createDiscount({
                        type: 'service',
                        service_id: serviceId,
                        sale_off: form.discount,
                        start_date: form.start_date!,
                        end_date: form.end_date!,
                    });
                    toast.success("✅ Tạo giảm giá cho dịch vụ thành công!");
                }
            }

            onCancel();
            await fetchServices();

        } catch (err) {
            console.error("❌ Lỗi khi tạo/cập nhật dịch vụ:", err);
            toast.error("❌ Đã xảy ra lỗi. Vui lòng thử lại.");
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onCancel}
        >
            <div
                className="bg-white p-6 rounded shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="w-40 text-sm font-medium text-gray-700">Tên dịch vụ</span>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="flex-1 border p-2 rounded"
                        />
                    </div>

                    <div className="flex items-start gap-3">
                        <span className="w-40 text-sm font-medium text-gray-700 pt-2">Mô tả</span>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className="flex-1 border p-2 rounded"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="w-40 text-sm font-medium text-gray-700">Giá</span>
                        <input
                            name="price"
                            type="number"
                            value={form.price}
                            onChange={handleChange}
                            className="flex-1 border p-2 rounded"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="w-40 text-sm font-medium text-gray-700">Giảm giá (%)</span>
                        <input
                            name="discount"
                            type="number"
                            value={form.discount}
                            onChange={handleChange}
                            className="flex-1 border p-2 rounded"
                            min={0}
                            max={100}
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 flex-1">
                            <span className="w-25 text-sm font-medium text-gray-700">Ngày bắt đầu</span>
                            <DatePicker
                                selected={form.start_date ? new Date(form.start_date) : null}
                                onChange={(date: Date | null) =>
                                    setForm((prev) => ({ ...prev, start_date: date || new Date() }))
                                }
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="yyyy-MM-dd HH:mm"
                                popperPlacement="top"
                                className="flex-1 border px-3 py-2 rounded"
                            />
                        </div>

                        <div className="flex items-center gap-2 flex-1">
                            <span className="w-23 text-sm font-medium text-gray-700">Ngày kết thúc</span>
                            <DatePicker
                                selected={form.end_date ? new Date(form.end_date) : null}
                                onChange={(date: Date | null) =>
                                    setForm((prev) => ({ ...prev, end_date: date || new Date() }))
                                }
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="yyyy-MM-dd HH:mm"
                                popperPlacement="top"
                                className="flex-1 border px-3 py-2 rounded"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="w-40 text-sm font-medium text-gray-700">Loại dịch vụ</span>
                        <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className="flex-1 border p-2 rounded"
                        >
                            <option value="at_store">Tại cửa hàng</option>
                            <option value="at_home">Tại nhà</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="w-40 text-sm font-medium text-gray-700">Thời gian ước tính</span>
                        <input
                            name="estimated_time"
                            value={form.estimated_time}
                            onChange={handleChange}
                            className="flex-1 border p-2 rounded"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="w-40 text-sm font-medium text-gray-700">Trạng thái</span>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="flex-1 border p-2 rounded"
                        >
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Không hoạt động</option>
                            <option value="hidden">Ẩn</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="w-40 text-sm font-medium text-gray-700">Danh mục sửa chữa</span>
                        <select
                            name="category_id"
                            value={form.category_id}
                            onChange={handleChange}
                            className="flex-1 border p-2 rounded"
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Hình ảnh (tối đa 3)</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full"
                            disabled={(form.images?.length || 0) >= 3}
                        />
                        <div className="flex flex-wrap gap-3 mt-3">
                            {form.images &&
                                form.images.map((img, index) => {
                                    const url = img instanceof File ? URL.createObjectURL(img) : img.url;
                                    return (
                                        <div
                                            key={index}
                                            className="relative w-24 h-24 border rounded overflow-hidden"
                                        >
                                            <img src={url} alt="preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border rounded"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Đang lưu..." : "Lưu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

}