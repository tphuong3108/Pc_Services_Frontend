/* eslint-disable prefer-const */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Star, X } from "lucide-react";
import Button from "@/components/common/Button";
import { UploadedImage, Product } from "@/types/Product";
import { Category } from "@/types/Category";
import { toast } from "react-toastify";
import {discountService } from "@/services/discount.service"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { productService } from "@/services/product.service";

type ProductFormData = {
  name?: string;
  slug?: string;
  tags?: string[];
  ports?: string[];
  panel?: string;
  resolution?: string;
  size?: string;
  model?: string;
  description?: string;
  price?: number;
  discountPercent?: number; 
  quantity?: number;
  status?: "available" | "out_of_stock" | "hidden";
  brand?: string;
  category_id?: string;
  images?: (File | UploadedImage)[];
  startDate?: Date | null;
  endDate?:Date | null;
};


interface ProductFormModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (productData: Partial<Product>) => Promise<void>;
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  categories: Category[];
  editingProduct: Product | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  updateDiscountForProduct: (productId: string, ) => Promise<void>; // 👈 THÊM DÒNG NÀY
}

export default function ProductFormModal({
  show,
  onClose,
  onSubmit,
  formData,
  setFormData,
  categories,
  editingProduct,
  handleImageChange,
  updateDiscountForProduct,
  removeImage,
}: ProductFormModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = useState(false);

useEffect(() => {
  const fetchDiscount = async () => {
    if (editingProduct?._id) {
      try {
        const res = await discountService.getDiscountById('product', editingProduct._id);
        if (res?.sale_off && res.start_date && res.end_date) {
          const now = new Date();
          const start = new Date(res.start_date);
          const end = new Date(res.end_date);
          setFormData((prev) => ({
            ...prev,
            discountPercent: res.sale_off ,
            startDate: start,
            endDate: end,
          }));
        }
      } catch (error) {
        console.warn("⚠️ Không tìm thấy discount cho sản phẩm này.", error);
      }
    }
  };

  fetchDiscount();
}, [editingProduct]); 


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show]);

  // Validate ảnh và giới hạn upload
  const handleSafeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const newImages: File[] = [];

    for (let file of files) {
      if (file.size > maxSize) {
        toast.error(`Ảnh "${file.name}" vượt quá 5MB và sẽ không được thêm.`);
      } else {
        newImages.push(file);
      }
    }

    const total = (formData.images?.length || 0) + newImages.length;
    if (total > 3) {
      toast.warning("Chỉ được phép tải tối đa 3 ảnh.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...newImages],
    }));
  };

  // Gửi form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setSubmitting(true);

  // Kiểm tra dữ liệu cơ bản
  if (!formData.name || !formData.slug || !formData.price) {
    toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc!");
    setSubmitting(false);
    return;
  }
 // gọi valdate cho update 
  try {
    await onSubmit(formData as Partial<Product>);

    if (editingProduct?._id) {
      const discountValue = formData.discountPercent ?? 0;
      const startDate = formData.startDate ? new Date(formData.startDate) : new Date();;
      const endDate = formData.endDate ? new Date(formData.endDate) : new Date();
      // Cập nhật discount trên server
      if (discountValue > 0) {
        await discountService.updateDiscount('product', editingProduct._id, { sale_off: discountValue , start_date: startDate, end_date: endDate});
        console.log("✅ Cập nhật giảm giá thành công:", discountValue);
      } else {
        await discountService.updateDiscount('product', editingProduct._id, { sale_off: 0 , start_date: new Date(), end_date: new Date()});
        console.log("🟠 Xóa giảm giá cho sản phẩm:", editingProduct._id);
      }
      // Gọi lại hàm cập nhật discount ở FE
      await updateDiscountForProduct(editingProduct._id);
    }else {
      // 🆕 Khi tạo mới sản phẩm
      const discountValue = formData.discountPercent ?? 0;

      if (discountValue > 0) {
        // 🧠 Lấy sản phẩm mới tạo gần nhất (vì onSubmit không trả _id)
        const res = await productService.getAll(1, 1); // API của bạn có getAll(limit, page)
        const newestProduct = res?.products?.[0]; // lấy sản phẩm mới nhất
        if (newestProduct?._id) {
          const startDate = formData.startDate ? new Date(formData.startDate) : new Date();
          const endDate = formData.endDate ? new Date(formData.endDate) : new Date();

          await discountService.createDiscount({
            type: 'product',
            product_id: newestProduct._id as string,
            sale_off: discountValue,
            start_date: startDate,
            end_date: endDate,
          });

          console.log("🆕 Tạo giảm giá mới cho:", newestProduct._id);
        } else {
          console.warn("⚠️ Không tìm thấy sản phẩm mới để tạo discount");
        }
      }
    }
    

    toast.success(
      editingProduct
        ? "✅ Cập nhật sản phẩm thành công!"
        : "✅ Thêm sản phẩm thành công!"
    );
    onClose();
  } catch (err) {
    toast.error("❌ Lỗi khi gửi dữ liệu. Vui lòng thử lại.");
    console.error(err);
  } finally {
    setSubmitting(false);
  }
};
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div
        ref={modalRef}
        className="bg-white p-6 rounded shadow w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-lg font-semibold mb-4">
          {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-23 text-sm font-medium text-gray-700">Tên sản phẩm</span>
            <input
              type="text"
              placeholder="Tên sản phẩm"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="flex-1 border px-3 py-2 rounded"
              required
            />
          </div> 
          <div className="flex items-center gap-3">
            <span className="w-28 text-sm font-medium text-gray-700">URL</span>   
          <input
            type="text"
            placeholder="Slug (URL friendly)"
            value={formData.slug || ""}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            required
          /></div>
          <div className="flex items-center gap-3">
            <span className="w-28 text-sm font-medium text-gray-700">Tag</span>
            <input
              type="text"
              placeholder="Tags (cách nhau bởi dấu ;)"
              value={formData.tags?.join(", ") || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                })
              }
              className="w-full border px-3 py-2 rounded"
              />
         </div>
         <div className="flex items-center gap-3">
          <span className="w-28 text-sm font-medium text-gray-700">Cổng kết nối</span>
          <input
            type="text"
            placeholder="Cổng kết nối (cách nhau bởi dấu ;)"
            value={formData.ports?.join(", ") || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                ports: e.target.value.split(",").map((p) => p.trim()).filter(Boolean),
              })
            }
            className="w-full border px-3 py-2 rounded"
          
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3">
            <span className="w-40 text-sm font-medium text-gray-700">Panel</span>
            <input
              type="text"
              placeholder="Panel"
              value={formData.panel || ""}
              onChange={(e) => setFormData({ ...formData, panel: e.target.value })}
              className="border px-3 py-2 rounded mr-[-5px]"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="w-32 text-sm font-medium text-gray-700 text-center">Độ phân giải</span>
            <input
              type="text"
              placeholder="Độ phân giải"
              value={formData.resolution || ""}
              onChange={(e) =>
                setFormData({ ...formData, resolution: e.target.value })
              }
              className="border px-3 py-2 rounded"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-32 text-sm font-medium text-gray-700">Kích thướt</span>
            <input
              type="text"
              placeholder="Kích thước"
              value={formData.size || ""}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="border px-3 py-2 rounded mr-[-5px]"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-32 text-sm font-medium text-gray-700 text-center">Mẫu</span>
            <input
              type="text"
              placeholder="Model"
              value={formData.model || ""}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="border px-3 py-2 rounded"
            />
          </div>
        </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3">
             <span className="w-32 text-sm font-medium text-gray-700">Giá</span>
             <input
              type="number"
              placeholder="Giá (VNĐ)"
              value={formData.price || ""}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
              className="border px-3 py-2 rounded mr-[-5px]"
              required
              min={0}
             />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-32 text-sm font-medium text-gray-700 text-center">Số lượng</span>
              <input
                type="number"
                placeholder="Số lượng"
                value={formData.quantity || ""}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: Number(e.target.value) })
                }
                className="border px-3 py-2 rounded"
                min={0}
                required
              />
            </div>
          </div>
                    
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-3">
              <span className="w-28 text-sm font-medium text-gray-700">Giảm giá</span>
              <input
                type="number"
                placeholder="Giảm giá (%)"
                value={formData.discountPercent || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountPercent: Number(e.target.value),
                  })
                }
                className="border px-6 py-2 rounded mr-[-13px]"
                min={0}
                max={100}
              />    
            </div>
            <div className="text-center -mt-[10px]">
              <span className="w-32 text-sm font-medium text-gray-700">Ngày bắt đầu</span>
              <label className="flex flex-col">
                <DatePicker
                  selected={formData.startDate ? new Date(formData.startDate) : null}
                  onChange={(date) => {
                    // Nếu có endDate mà endDate < startDate mới -> reset endDate
                    if (formData.endDate && date && new Date(formData.endDate) < date) {
                      setFormData({ ...formData, startDate: date, endDate: null });
                    } else {
                      setFormData({ ...formData, startDate: date });
                    }
                  }}
                  showTimeSelect
                  timeFormat="HH:mm"
                  placeholderText="Ngày bắt đầu"
                  timeIntervals={15}
                  dateFormat="yyyy-MM-dd HH:mm"
                  popperPlacement="top"
                  className="border px-2 py-1 text-sm rounded w-[120px]"

                />
              </label>
            </div>
            <div className="text-center -mt-[10px]">
              <span className="w-32 text-sm font-medium text-gray-700">Ngày kết thúc</span>
              <label className="flex flex-col">
                <DatePicker
                  selected={formData.endDate ? new Date(formData.endDate) : null}
                  onChange={(date) => {
                    if (formData.startDate && date && date < new Date(formData.startDate)) {
                      alert("Ngày kết thúc phải sau ngày bắt đầu!");
                    } else {
                      setFormData({ ...formData, endDate: date });
                    }
                  }}
                  showTimeSelect
                  timeFormat="HH:mm"
                  placeholderText="Ngày kết thúc"
                  timeIntervals={15}
                  dateFormat="yyyy-MM-dd HH:mm"
                  popperPlacement="top"
                  minDate={formData.startDate ? new Date(formData.startDate) : undefined} // 🟢 Không cho chọn trước startDate
                    className="border px-2 py-1 text-sm rounded w-[120px]"
                />
              </label>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-28 text-sm font-medium text-gray-700">Danh mục</span>
            <select
              value={formData.category_id || ""}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-28 text-sm font-medium text-gray-700">Thương hiệu</span>
            <input
              type="text"
              placeholder="Thương hiệu"
              value={formData.brand || ""}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-23 text-sm font-medium text-gray-700">Trạng thái</span>
            <select
              value={formData.status || "available"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "available" | "out_of_stock" | "hidden",
                })
              }
              className="border px-3 py-2 rounded"
            >
              <option value="available">Còn hàng</option>
              <option value="out_of_stock">Hết hàng</option>
              <option value="hidden">Ẩn</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-28 text-sm font-medium text-gray-700">Mô tả</span>
            <textarea
              placeholder="Mô tả"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border px-3 py-2 rounded"
              rows={4}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Hình ảnh (tối đa 3)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleSafeImageChange}
              className="w-full"
              disabled={(formData.images?.length || 0) >= 3}
            />
            <div className="flex flex-wrap gap-3 mt-3">
              {formData.images?.map((img, index) => {
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

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" type="button" onClick={onClose} disabled={submitting}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Đang lưu..." : editingProduct ? "Cập nhật" : "Thêm"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}