/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import { Edit, Trash, Eye } from "lucide-react";
import TableHeader from "@/components/admin/TableHeader";
import Button from "@/components/common/Button";
import { categoryService } from "@/services/category.service";
import { discountService } from "@/services/discount.service";
import { Category } from "@/types/Category";
import { mapCategory } from "@/lib/mappers";
import { toast } from "react-toastify";
import { showConfirmToast } from "@/components/common/ConfirmToast";
import "react-toastify/dist/ReactToastify.css";

export default function CategoryTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "", slug: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfirming, setIsConfirming] = useState(false); 

  const [discountFormAll, setDiscountFormAll] = useState({
    sale_off: 0,
    start_date: "",
    end_date: "",
  });
  const [isDiscounting, setIsDiscounting] = useState(false);

  const [discountForCategory, setDiscountForCategory] = useState({
    sale_off: 0,
    start_date: "",
    end_date: "",
  });

  const initialFormRef = useRef({ name: "", description: "", slug: "" });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll(20, 1);
      setCategories(data.categories.map(mapCategory));
    } catch (err) {
      console.error("Error fetching categories", err);
      toast.error("Không thể tải danh mục. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchGlobalDiscount = async () => {
      try {
        const data = await discountService.getDiscountforAll('product_category');
        if (data) {
          const discount = data[0] || data;
          const formatDateTimeLocal = (dateString: string) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            return date.toISOString().slice(0, 16);
          };
          setDiscountFormAll({
            sale_off: discount.sale_off || 0,
            start_date: discount.start_date ? formatDateTimeLocal(String(discount.start_date)) : "",
            end_date: discount.end_date ? formatDateTimeLocal(String(discount.end_date)) : "",
          });
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy giảm giá chung:", error);
      }
    };
    fetchGlobalDiscount();
  }, []);

  const openFormForNew = () => {
    setEditing(null);
    const base = { name: "", description: "", slug: "" };
    setForm(base);
    initialFormRef.current = base;
    setDiscountForCategory({ sale_off: 0, start_date: "", end_date: "" });
    setShowForm(true);
  };

  const openFormForEdit = async (c: Category) => {
    const base = {
      name: c.name,
      description: c.description || "",
      slug: c.slug || c.name.toLowerCase().replace(/\s+/g, "-"),
    };
    setEditing(c);
    setForm(base);
    initialFormRef.current = base;
    try {
      const res = await discountService.getDiscountById('product_category', c._id);
      if (res) {
        const formatDate = (d: any) => d ? new Date(d).toISOString().slice(0, 16) : "";

        setDiscountForCategory({
          sale_off: res.sale_off ?? 0,
          start_date: formatDate(res.start_date),
          end_date: formatDate(res.end_date),
        });
      }
      else {
        setDiscountForCategory({ sale_off: 0, start_date: "", end_date: "" });
      }
    } catch (err) {
      console.error("Error loading category discount:", err);
      setDiscountForCategory({ sale_off: 0, start_date: "", end_date: "" });
    }

    setShowForm(true);
  };

  const isDirty = () => {
    const init = initialFormRef.current;
    return (
      init.name !== form.name ||
      init.description !== form.description ||
      init.slug !== form.slug
    );
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (showForm && isDirty()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [showForm, form]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Tên danh mục không được để trống.");
      return;
    }

    const slug = form.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "");

    const payload = { ...form, slug };
    const toastId = toast.loading(editing ? "Đang cập nhật danh mục..." : "Đang tạo danh mục...");

    try {
      setIsSubmitting(true);

      let savedApiData: any;
      if (editing) {
        savedApiData = await categoryService.update(editing._id, payload);
        toast.update(toastId, { render: "Cập nhật danh mục thành công", type: "success", isLoading: false, autoClose: 2000 });
      } else {
        savedApiData = await categoryService.create(payload);
        toast.update(toastId, { render: "Tạo danh mục thành công", type: "success", isLoading: false, autoClose: 2000 });
      }

      const savedCategory = mapCategory(savedApiData);

      if (!savedCategory || !savedCategory._id) {
        console.error("Không thể xác định ID danh mục sau khi lưu", savedApiData);
        toast.error("Không xác định được ID danh mục sau khi lưu.");
        return;
      }

      const { sale_off, start_date, end_date } = discountForCategory;
      const hasDiscountInfo = (sale_off !== undefined && sale_off !== null);

      if (hasDiscountInfo) {
        try {
          await discountService.updateDiscount('product_category', savedCategory._id, {
            sale_off: Number(sale_off),
            start_date: start_date ? new Date(start_date) : new Date(),
            end_date: end_date ? new Date(end_date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });

          if (Number(sale_off) > 0) {
            toast.success(`Áp dụng giảm ${sale_off}% cho danh mục ${savedCategory.name}`);
          } else {
            toast.info(`Đã xóa giảm giá cho danh mục ${savedCategory.name}`);
          }
        } catch (discountErr) {
          console.error("Lỗi khi cập nhật giảm giá cho danh mục:", discountErr);
          toast.error("Lưu danh mục thành công nhưng lỗi khi cập nhật giảm giá cho danh mục.");
        }
      }

      setShowForm(false);
      setForm({ name: "", description: "", slug: "" });
      setEditing(null);
      initialFormRef.current = { name: "", description: "", slug: "" };
      await fetchCategories();
    } catch (err) {
      console.error("Error saving category", err);
      toast.update(toastId, { render: "Lỗi khi lưu danh mục", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmToast({
      message: "Bạn có chắc muốn xóa danh mục này?",
      confirmText: "Xóa",
      cancelText: "Hủy",
    });
    if (!confirmed) return;

    const toastId = toast.loading("Đang xóa danh mục...");
    try {
      await categoryService.delete(id);
      await fetchCategories();
      toast.update(toastId, { render: "Đã xóa danh mục", type: "success", isLoading: false, autoClose: 2000 });
    } catch (err) {
      console.error("Error deleting category", err);
      toast.update(toastId, { render: "Xóa thất bại", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  const handleCloseForm = async () => {
    if (isDirty()) {
      const confirmed = await showConfirmToast({
        message: "Bạn đã thay đổi form nhưng chưa lưu. Rời đi sẽ mất thay đổi. Bạn có chắc?",
        confirmText: "Rời đi",
        cancelText: "Ở lại",
      });
      if (!confirmed) return;
    }
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", description: "", slug: "" });
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const handleApplyGlobalDiscount = async () => {
    const start = new Date(discountFormAll.start_date);
    const end = new Date(discountFormAll.end_date);
    const today = new Date();
    const value = discountFormAll.sale_off;
    setIsConfirming(true); 

    if (value < 0) {
      toast.error("Phần trăm giảm không hợp lệ!");
      setIsConfirming(false);
      return;
    }

    if (value > 0 && (!discountFormAll.start_date || !discountFormAll.end_date)) {
      toast.error("Vui lòng chọn ngày bắt đầu và kết thúc!");
      setIsConfirming(false);
      return;
    }

    if (value > 0 && start <= today) {
      toast.error("Ngày bắt đầu không được nhỏ hơn hôm nay!");
        setIsConfirming(false); 
      return;
    }

    if (value > 0 && end <= start) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu!");
      setIsConfirming(false);
      return;
    }

    const confirmed = await showConfirmToast({
      message: value === 0 ? "Bạn có chắc muốn xóa giảm giá chung không?" : `Áp dụng giảm giá ${value}% cho tất cả sản phẩm?`,
      confirmText: "Xác nhận",
      cancelText: "Hủy",
    });
    if (!confirmed) 
      {
        setIsConfirming(false);
        return;
      }

    const toastId = toast.loading("Đang áp dụng giảm giá...");
    try {
      setIsDiscounting(true);
      await discountService.updateDiscountforAll('product_category', {
        sale_off: Number(value),
        start_date: start,
        end_date: end,
      });
      toast.update(toastId, { render: "Áp dụng giảm giá thành công!", type: "success", isLoading: false, autoClose: 2500 });
    } catch (err) {
      console.error("Error applying discount", err);
      toast.update(toastId, { render: "Lỗi khi áp dụng giảm giá!", type: "error", isLoading: false, autoClose: 2500 });
    } finally {
      setIsDiscounting(false);
      setIsConfirming(true); 
    }
  };

  return (
    <div className="bg-white shadow rounded p-4">
      <TableHeader
        title="Quản lý danh mục sản phẩm"
        breadcrumb={["Admin", "Danh mục sản phẩm"]}
        actions={
          <Button variant="primary" onClick={openFormForNew}>
            + Thêm danh mục
          </Button>
        }
      />

      <div className="relative w-full md:w-1/2 lg:w-1/3 mb-4">
        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="Tìm kiếm danh mục..."
          className="border pl-10 pr-4 py-2 rounded w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="border p-4 rounded-lg mb-6 bg-gray-50">
        <h3 className="font-semibold text-lg mb-3">Siêu sale sản phẩm</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 items-end gap-4">
          <div>
            <label className="block text-sm mb-1">Phần trăm giảm (%)</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-full"
              placeholder="Nhập % giảm"
              value={discountFormAll.sale_off}
              onChange={(e) => setDiscountFormAll({ ...discountFormAll, sale_off: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Ngày bắt đầu</label>
            <input
              type="datetime-local"
              className="border rounded px-2 py-1 w-full"
              value={discountFormAll.start_date}
              onChange={(e) => setDiscountFormAll({ ...discountFormAll, start_date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Ngày kết thúc</label>
            <input
              type="datetime-local"
              className="border rounded px-2 py-1 w-full"
              value={discountFormAll.end_date}
              onChange={(e) => setDiscountFormAll({ ...discountFormAll, end_date: e.target.value })}
            />
          </div>

          <div className="flex md:justify-center">
            {isDiscounting || isConfirming ? (
              <Button
                disabled
                className="w-full md:w-auto mt-1 bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed opacity-70"
              >
                {isDiscounting ? "Đang áp dụng..." : "Đang xác nhận..."}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleApplyGlobalDiscount}
                className="w-full md:w-auto mt-1 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
              >
                Áp dụng giảm giá chung
              </Button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-left border-collapse hidden lg:table">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Tên danh mục</th>
                <th className="p-2">Mô tả</th>
                <th className="p-2">Ngày tạo</th>
                <th className="p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((c) => (
                <tr key={c._id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.description}</td>
                  <td className="p-2">{new Date(c.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="p-2 flex gap-2">
                    <Eye className="w-4 h-4 cursor-pointer text-blue-600" />
                    <Edit className="w-4 h-4 cursor-pointer text-yellow-600" onClick={() => openFormForEdit(c)} />
                    <Trash className="w-4 h-4 cursor-pointer text-red-600" onClick={() => handleDelete(c._id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="lg:hidden space-y-4 mt-4">
            {filteredCategories.map((c) => (
              <div key={c._id} className="border rounded p-4 shadow-sm flex flex-col gap-2">
                <p><span className="font-semibold">Tên:</span> {c.name}</p>
                <p><span className="font-semibold">Mô tả:</span> {c.description || "—"}</p>
                <p><span className="font-semibold">Ngày tạo:</span> {new Date(c.createdAt).toLocaleDateString("vi-VN")}</p>
                <div className="flex gap-4 pt-2">
                  <Eye className="w-4 h-4 cursor-pointer text-blue-600" />
                  <Edit className="w-4 h-4 cursor-pointer text-yellow-600" onClick={() => openFormForEdit(c)} />
                  <Trash className="w-4 h-4 cursor-pointer text-red-600" onClick={() => handleDelete(c._id)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-96 relative">
            <h2 className="text-lg font-bold mb-4">{editing ? "Sửa danh mục" : "Thêm danh mục"}</h2>

            <div className="mb-3">
              <label className="block text-sm">Tên danh mục</label>
              <input className="w-full border p-2 rounded" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={isSubmitting} />
            </div>

            <div className="mb-3">
              <label className="block text-sm">Mô tả</label>
              <textarea className="w-full border p-2 rounded" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} disabled={isSubmitting} />
            </div>

            <div className="mb-3 border p-3 rounded bg-gray-50">
              <h3 className="font-medium mb-2">Giảm giá cho danh mục (tùy chọn)</h3>
              <div className="grid grid-cols-1 gap-2">
                <input type="number" name="sale_off" min={0} max={100} placeholder="Giảm giá %" className="border p-2 rounded" value={discountForCategory.sale_off} onChange={(e) => setDiscountForCategory({ ...discountForCategory, sale_off: Number(e.target.value) })} />
                <input type="datetime-local" name="start_date" className="border p-2 rounded" value={discountForCategory.start_date} onChange={(e) => setDiscountForCategory({ ...discountForCategory, start_date: e.target.value })} />
                <input type="datetime-local" name="end_date" className="border p-2 rounded" value={discountForCategory.end_date} onChange={(e) => setDiscountForCategory({ ...discountForCategory, end_date: e.target.value })} />
                <small className="text-sm text-gray-500">Để trống hoặc đặt giảm giá = 0 để không áp dụng giảm giá cho danh mục.</small>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={handleCloseForm} disabled={isSubmitting}>Hủy</Button>
              <Button variant="primary" onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : "Lưu"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}