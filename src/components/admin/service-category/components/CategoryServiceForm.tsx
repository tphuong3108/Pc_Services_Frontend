/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { CategoryService } from "@/types/CategoryService"
import { showConfirmToast } from "@/components/common/ConfirmToast"
import { toast } from "react-toastify"
import { discountService } from "@/services/discount.service"


interface Props {
  initialData?: Partial<CategoryService>
    onSubmit: (data: Partial<CategoryService>) => Promise<CategoryService>  // ✅ đổi kiểu

  onCancel: () => void
  isSubmitting?: boolean
}

export default function CategoryServiceForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: Props) {
  const [form, setForm] = useState<Partial<CategoryService>>({
    name: "",
    description: "",
    status: "active",
  })
 const [discount, setDiscount] = useState<{ sale_off: number; start_date: string; end_date: string }>({
    sale_off: 0,
    start_date: "",
    end_date: "",
  })
  const [loadingDiscount, setLoadingDiscount] = useState(false)

  const [initial, setInitial] = useState(JSON.stringify(form))

   useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        status: initialData.status || "active",
      })
      setInitial(JSON.stringify(initialData))

      // Load discount nếu có
      if (initialData._id) {
        const loadDiscount = async () => {
          setLoadingDiscount(true)
          try {
            const res = await discountService.getDiscountById('service_category', initialData._id!)
            if (res) {
            const formatDate = (d: any) => d ? new Date(d).toISOString().slice(0, 16) : "";

            setDiscount({
                sale_off: res.sale_off ?? 0,
                start_date: formatDate(res.start_date),
                end_date: formatDate(res.end_date),
            });
            }

          } catch (err) {
            console.error("❌ Lỗi khi load discount:", err)
          } finally {
            setLoadingDiscount(false)
          }
        }
        loadDiscount()
      }
    }
  }, [initialData])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    if (name === "sale_off" || name === "start_date" || name === "end_date") {
      setDiscount(prev => ({ ...prev, [name]: name === "sale_off" ? Number(value) : value }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleCancel = async () => {
    const current = JSON.stringify(form)
    if (current !== initial) {
      const confirmed = await showConfirmToast({
        message: "Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ bị mất.",
        confirmText: "Hủy bỏ",
        cancelText: "Tiếp tục chỉnh sửa",
      })
      if (!confirmed) return
    }
    onCancel()
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!form.name?.trim()) {
    toast.error("Tên danh mục không được để trống.")
    return
  }

  try {
    const saved = await onSubmit(form)
    if (!saved?._id) {
      toast.error("Không thể xác định ID danh mục sau khi lưu.")
      return
    }

    if (discount.sale_off > 0 && discount.start_date && discount.end_date) {
      try {
        const existed = await discountService.getDiscountById('service_category', saved._id)

        if (existed) {
          await discountService.updateDiscount('service_category', saved._id, {
            sale_off: discount.sale_off,
            start_date: new Date(discount.start_date),
            end_date: new Date(discount.end_date),
          })
          toast.success("Đã cập nhật giảm giá cho danh mục!")
        } else {
          await discountService.createDiscount({
            type: 'service_category',
            service_category_id: saved._id,
            sale_off: discount.sale_off,
            start_date: new Date(discount.start_date),
            end_date: new Date(discount.end_date),
          })
          toast.success("Đã tạo giảm giá cho danh mục!")
        }
      } catch (err) {
        console.error("❌ Lỗi khi tạo/cập nhật discount:", err)
        toast.error("Không thể lưu giảm giá.")
      }
    }
  } catch (error) {
    console.error("❌ Lỗi khi lưu danh mục:", error)
    toast.error("Lưu danh mục thất bại.")
  }
}

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        name="name"
        placeholder="Tên danh mục"
        value={form.name}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        disabled={isSubmitting}
      />

      <textarea
        name="description"
        placeholder="Mô tả"
        value={form.description}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        disabled={isSubmitting}
      />

      <select
        name="status"
        value={form.status}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        disabled={isSubmitting}
      >
        <option value="active">Đã mở</option>
        <option value="inactive">Tạm ngừng</option>
        <option value="hidden">Đã ẩn</option>
      </select>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <input
            type="number"
            name="sale_off"
            placeholder="Giảm giá %"
            value={discount.sale_off}
            min={0}
            max={100}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value < 0 || value > 100) {
                toast.error("Phần trăm giảm phải nằm trong khoảng 0–100%");
              }
              handleChange(e);
            }}
            className={`border p-2 rounded w-full ${
              discount.sale_off < 0 || discount.sale_off > 100
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {discount.sale_off < 0 || discount.sale_off > 100 ? (
            <p className="text-xs text-red-500 mt-1">Giá trị phải từ 0–100%</p>
          ) : null}
        </div>

        <div>
          <input
            type="datetime-local"
            name="start_date"
            value={discount.start_date}
            onChange={(e) => {
              const value = e.target.value;
              if (
                discount.end_date &&
                new Date(value) > new Date(discount.end_date)
              ) {
                toast.error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
              }
              handleChange(e);
            }}
            className={`border p-2 rounded w-full ${
              discount.start_date &&
              discount.end_date &&
              new Date(discount.start_date) > new Date(discount.end_date)
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
        </div>

        <div>
          <input
            type="datetime-local"
            name="end_date"
            value={discount.end_date}
            onChange={(e) => {
              const value = e.target.value;
              if (
                discount.start_date &&
                new Date(value) < new Date(discount.start_date)
              ) {
                toast.error("Ngày kết thúc phải lớn hơn ngày bắt đầu");
              }
              handleChange(e);
            }}
            className={`border p-2 rounded w-full ${
              discount.start_date &&
              discount.end_date &&
              new Date(discount.end_date) < new Date(discount.start_date)
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 border rounded"
          disabled={isSubmitting}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </form>
  )
}