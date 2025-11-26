/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { bannerService } from "@/services/banner.service";
import { toast } from "react-toastify";

export default function BannerForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  // chỉ chọn ảnh + preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    // check image resolution before accepting; run async check and stop the rest of the handler
    const urlForCheck = URL.createObjectURL(selected);
    (async () => {
      try {
        // check file size first (max 5 MB)
        const MAX_SIZE = 5 * 1024 * 1024; // bytes
        if (selected.size > MAX_SIZE) {
          toast.error("Kích thước tệp quá lớn. Vui lòng chọn tệp ≤ 5MB.");
          URL.revokeObjectURL(urlForCheck);
          return;
        }

        const bitmap = await createImageBitmap(selected);
        const { width, height } = bitmap;

        // adjust minimums as needed
        const MIN_WIDTH = 720;
        const MIN_HEIGHT = 480;
        const MAX_WIDTH = 2000;
        const MAX_HEIGHT = 1200;

        if (width < MIN_WIDTH || height < MIN_HEIGHT) {
          toast.error(`Kích thước ảnh quá nhỏ. Yêu cầu tối thiểu ${MIN_WIDTH}x${MIN_HEIGHT}px (hiện tại ${width}x${height}px).`);
          URL.revokeObjectURL(urlForCheck);
          return;
        }

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          toast.error(`Kích thước ảnh quá lớn. Yêu cầu tối đa ${MAX_WIDTH}x${MAX_HEIGHT}px (hiện tại ${width}x${height}px).`);
          URL.revokeObjectURL(urlForCheck);
          return;
        }

        const ratio = width / height;
        const ALLOWED = [16 / 9, 3 / 1];
        const EPS = 0.02; // tolerance for minor rounding differences

        const valid = ALLOWED.some((r) => Math.abs(ratio - r) <= EPS);
        if (!valid) {
          toast.error("Tỷ lệ ảnh không hợp lệ. Vui lòng chọn ảnh có tỉ lệ 16:9 hoặc 3:1.");
          URL.revokeObjectURL(urlForCheck);
          return;
        }

        // acceptable — set file and preview (we use the same object URL)
        setFile(selected);
        setPreview(urlForCheck);
      } catch (err) {
        console.error("Image check error:", err);
        toast.error("Không thể đọc ảnh. Vui lòng thử lại.");
        URL.revokeObjectURL(urlForCheck);
      }
    })();

    return;

    // setFile(selected);
    // const url = URL.createObjectURL(selected);
    // setPreview(url);
  };

  // submit toàn bộ form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Vui lòng chọn ảnh trước khi tạo ảnh.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("description", description || "");
      formData.append("title", title || "");
      formData.append("link", link || "#");
      formData.append("layout", "1");
      formData.append("position", "0");

      await bannerService.create(formData);
      toast.success("Tạo ảnh thành công!");

      // reset form
      setPreview(null);
      setFile(null);
      setDescription("");
      setTitle("");
      setLink("");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Có lỗi xảy ra khi tạo ảnh.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Tiêu đề</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="Nhập tiêu đề"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Liên kết</label>
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Mô tả</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded border px-3 py-2"
          rows={3}
          placeholder="Mô tả ảnh..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Hình ảnh</label>
        <label className="flex h-28 w-28 cursor-pointer items-center justify-center rounded-md border-2 border-dashed bg-gray-50 hover:bg-gray-100 relative">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover rounded-md"
            />
          ) : (
            <div className="flex flex-col items-center text-gray-400 text-sm">
              <Upload className="h-6 w-6 mb-1" />
              Chọn ảnh
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:opacity-90 transition"
        disabled={uploading}
      >
        {uploading ? "Đang tải..." : "Tạo ảnh"}
      </button>
    </form>
  );
}
