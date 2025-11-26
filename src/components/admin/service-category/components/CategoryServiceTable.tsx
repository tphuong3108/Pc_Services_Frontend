"use client"

import { useEffect, useState } from "react"
import { Edit, Trash } from "lucide-react"
import { categoryServiceService } from "@/services/categoryservice.service"
import { CategoryService } from "@/types/CategoryService"
import TableHeader from "@/components/admin/TableHeader"
import Button from "@/components/common/Button"
import Modal from "@/components/admin/services/Modal"
import CategoryServiceForm from "./CategoryServiceForm"
import { toast } from "react-toastify"
import { showConfirmToast } from "@/components/common/ConfirmToast"
import "react-toastify/dist/ReactToastify.css"
import { discountService } from "@/services/discount.service"

export default function CategoryServiceTable() {
  const [categories, setCategories] = useState<CategoryService[]>([])
  const [filteredCategories, setFilteredCategories] = useState<CategoryService[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryService | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false);
  const [discountForm, setDiscountForm] = useState({
    sale_off: 0,
    start_date: "",
    end_date: "",
  });

  const fetchData = async () => {
    try {
      const data = await categoryServiceService.getAll()
      setCategories(data)
      setFilteredCategories(data)
    } catch (err) {
      console.error("Lỗi tải danh mục:", err)
      toast.error("Không thể tải danh mục. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }
  const fetchGlobalDiscount = async () => {
  try {
    const data = await discountService.getDiscountforAll("service_category");

    if (data && data.length > 0) {
      const { sale_off, start_date, end_date } = data[0];

      const formatDate = (d: Date | string) => {
        if (!d) return "";
        const dateObj = typeof d === "string" ? new Date(d) : d;
        return dateObj.toISOString().slice(0, 16);
      };

      setDiscountForm({
        sale_off,
        start_date: formatDate(start_date),
        end_date: formatDate(end_date),
      });
    } else {
      console.warn("⚠️ Không có giảm giá chung nào cho danh mục dịch vụ.");
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy giảm giá chung:", error);
  }
};



  useEffect(() => {
    fetchData();
    fetchGlobalDiscount();

  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      const query = searchQuery.trim().toLowerCase()
      if (!query) {
        setFilteredCategories(categories)
      } else {
        setFilteredCategories(
          categories.filter(
            (c) =>
              c.name.toLowerCase().includes(query) ||
              c.description?.toLowerCase().includes(query)
          )
        )
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchQuery, categories])


  const handleSubmit = async (payload: Partial<CategoryService>): Promise<CategoryService> => {
    if (!payload.name?.trim()) {
      toast.error("Tên danh mục không được để trống.")
      throw new Error("Invalid name")
    }

      payload.slug = (payload.name || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove diacritics
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .replace(/\s+/g, "-") // spaces to dash
        .replace(/[^a-z0-9-]/g, "") // remove invalid chars
        .replace(/-+/g, "-") // collapse multiple dashes
        .replace(/(^-|-$)/g, ""); // trim leading/trailing dash
    setIsSubmitting(true)
    const toastId = toast.loading(editing ? "Đang cập nhật..." : "Đang thêm danh mục...")

    try {
      let saved: CategoryService

      if (editing) {
        const result = await categoryServiceService.update(editing._id, payload)
        if (!result) {
          // bảo đảm không trả về null
          throw new Error("Server trả về null khi cập nhật danh mục")
        }
        saved = result
        toast.update(toastId, {
          render: "✅ Cập nhật thành công",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
      } else {
        const result = await categoryServiceService.create(payload)
        if (!result) {
          // bảo đảm không trả về null
          throw new Error("Server trả về null khi tạo danh mục")
        }
        saved = result
        toast.update(toastId, {
          render: "✅ Thêm mới thành công",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
      }

      await fetchData()
      setModalOpen(false)
      setEditing(null)

      return saved
    } catch (err) {
      console.error("Lỗi khi lưu danh mục:", err)
      toast.update(toastId, {
        render: "❌ Không thể lưu danh mục!",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      })
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleDelete = async (id: string) => {
    const confirm = await showConfirmToast({
      message: "Bạn có chắc muốn xóa danh mục này?",
      confirmText: "Xóa",
      cancelText: "Hủy"
    })
    if (!confirm) {
      toast.info("Đã hủy xóa.")
      return
    }

    const toastId = toast.loading("Đang xóa danh mục...")
    try {
      await categoryServiceService.delete(id)
      fetchData()
      toast.update(toastId, { render: "✅ Đã xóa danh mục", type: "success", isLoading: false, autoClose: 2000 })
    } catch (err) {
      console.error("Lỗi khi xóa danh mục:", err)
      toast.update(toastId, { render: "❌ Xóa thất bại", type: "error", isLoading: false, autoClose: 3000 })
    }
  }
  const handleCreateGlobalDiscount = async () => {
  try {
   

    const start = new Date(discountForm.start_date);
    const end = new Date(discountForm.end_date);
    const now = new Date();
    const value = discountForm.sale_off;
    setIsConfirming(true);

    if(value == 0){
      const confirmed = await showConfirmToast({
        message: `Bạn có chắc xóa giảm giá chứ ?`,
        confirmText: "Áp dụng",
        cancelText: "Hủy",
      });
      if (!confirmed){
        setIsConfirming(false);
        return;
      }
    }
    else if(value!=0){
      if (!discountForm.start_date || !discountForm.end_date) {
        toast.error("Vui lòng nhập đầy đủ thông tin giảm giá!");
        setIsConfirming(false);
        return;
      }
      if (start <= now) {
        toast.error("⛔ Ngày bắt đầu phải lớn hơn hôm nay!");
        setIsConfirming(false);
        return;
      }
      if (end <= start) {
        toast.error("⛔ Ngày kết thúc phải sau ngày bắt đầu!");
        setIsConfirming(false);
        return;
      }
      if (value<0) {
        toast.error("Giảm giá không được nhỏ hơn 0!");
        setIsConfirming(false);
        return;
      }
      }else {
        const confirmed = await showConfirmToast({
        message: `Áp dụng giảm giá ${discountForm.sale_off}% cho tất cả dịch vụ?`,
        confirmText: "Áp dụng",
        cancelText: "Hủy",
      });
      if (!confirmed){
        setIsConfirming(false);
        return;
      }
      }
      const payload = {
        type: 'service_category',
        sale_off: discountForm.sale_off,
        start_date: start,
        end_date: end,
      };

      const toastId = toast.loading("Đang tạo giảm giá chung...");
      await discountService.updateDiscountforAll('service_category', payload);
      toast.update(toastId, { render: "Giảm giá chung được tạo thành công!", type: "success", isLoading: false, autoClose: 2000 });
      fetchGlobalDiscount();
    } catch (error) {
      console.error("❌ Lỗi khi tạo giảm giá:", error);
      toast.error("Không thể tạo giảm giá chung!");
    }
  };


  if (loading) return <p className="p-4">Đang tải dữ liệu...</p>

  return (
    <div className="bg-white shadow rounded p-4">
      <TableHeader
        title="Quản lý danh mục dịch vụ"
        breadcrumb={["Admin", "Danh mục dịch vụ"]}
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditing(null)
              setModalOpen(true)
            }}
          >
            + Thêm danh mục
          </Button>
        }
      />

      <div className="my-4">
        <input
          type="text"
          className="border px-3 py-2 rounded w-full max-w-xs"
          placeholder="Tìm kiếm danh mục..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
     <div className="border p-4 rounded-lg mb-6 bg-gray-50">
      <h3 className="font-semibold text-lg mb-3">Giảm giá chung cho tất cả dịch vụ</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 items-end gap-4">
        {/* Phần trăm giảm */}
        <div>
          <label className="block text-sm mb-1">Phần trăm giảm (%)</label>
          <input
            type="number"
            className="border rounded px-2 py-1 w-full"
            value={discountForm.sale_off}
            onChange={(e) =>
              setDiscountForm({ ...discountForm, sale_off: Number(e.target.value) })
            }
          />
        </div>

        {/* Ngày bắt đầu */}
        <div>
          <label className="block text-sm mb-1">Ngày bắt đầu</label>
          <input
            type="datetime-local"
            className="border rounded px-2 py-1 w-full"
            value={discountForm.start_date}
            onChange={(e) =>
              setDiscountForm({ ...discountForm, start_date: e.target.value })
            }
          />
        </div>

        {/* Ngày kết thúc */}
        <div>
          <label className="block text-sm mb-1">Ngày kết thúc</label>
          <input
            type="datetime-local"
            className="border rounded px-2 py-1 w-full"
            value={discountForm.end_date}
            onChange={(e) =>
              setDiscountForm({ ...discountForm, end_date: e.target.value })
            }
          />
        </div>

        {/* Nút áp dụng */}
         <div className="flex md:justify-center">
          {!isConfirming && (
            <Button
              variant="primary"
              onClick={handleCreateGlobalDiscount}
              className="w-full md:w-auto mt-1 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
            >
              Áp dụng giảm giá chung
            </Button>
          )}

          {isConfirming && (
            <Button
              disabled
              className="w-full md:w-auto mt-1 bg-gray-400 text-gray-200 border-gray-400 cursor-not-allowed opacity-70"
            >
              Đang xác nhận...
            </Button>
          )}
        </div>
      </div>
    </div>
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Tên danh mục</th>
            <th className="p-2">Mô tả</th>
            <th className="p-2">Trạng thái</th>
            <th className="p-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center p-4 text-gray-500">
                Không có danh mục nào phù hợp.
              </td>
            </tr>
          ) : (
            filteredCategories.map((c) => (
              <tr key={c._id} className="border-b hover:bg-gray-50">
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.description}</td>
                <td className="p-2">
                  {c.status === "active"
                    ? "Hoạt động"
                    : c.status === "inactive"
                      ? "Ngừng hoạt động"
                      : c.status === "hidden"
                        ? "Đã ẩn"
                        : c.status}
                </td>
                <td className="p-2 flex gap-2">
                  <Edit
                    className="w-4 h-4 text-yellow-600 cursor-pointer"
                    onClick={() => {
                      setEditing(c)
                      setModalOpen(true)
                    }}
                  />
                  <Trash
                    className="w-4 h-4 text-red-600 cursor-pointer"
                    onClick={() => handleDelete(c._id)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Sửa danh mục" : "Thêm danh mục"}
      >
        <CategoryServiceForm
          initialData={editing || undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  )
}