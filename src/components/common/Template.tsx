/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { bannerService } from "@/services/banner.service";
import { toast } from "react-toastify";

type BannerItem = {
  id: string;
  _id: string;
  image: string
  | { url: string; public_id: string; width?: number; height?: number };
  position: number;
  updatedAt?: string;
};

export default function DragDropBannerLayout() {
  const [selectedTemplate, setSelectedTemplate] = useState<"template1" | "template2" | "template3">("template1");
  const [currentTemplate, setCurrentTemplate] = useState<string>("");
  const [holders, setHolders] = useState<(BannerItem | null)[]>([]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<BannerItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 15;
  const maxSlots = selectedTemplate === "template2" ? 1 : selectedTemplate === "template3" ? 4 : 3;

  const fetchBanners = async () => {
    try {
      const res = await bannerService.getAll(pageSize, currentPage);
      const data = res.banners;
      if (currentTemplate === "") {
        // ✅ B1: Tìm ảnh mới nhất có position > 0 để xác định template
        const layoutToTemplate: Record<string, "template1" | "template2" | "template3"> = {
          option1: "template1",
          option2: "template2",
          option3: "template3",
        };

        for (const b of data) {
          if (b.position > 0 && typeof b.layout === "string") {
            const layoutKey = b.layout.toLowerCase(); // e.g. "option1"
            const detectedTemplate = layoutToTemplate[layoutKey];
            if (detectedTemplate) {
              setCurrentTemplate(detectedTemplate);
              setSelectedTemplate(detectedTemplate);
              break;
            }
          }
        }
      }

      // ✅ B2: Chuẩn bị banners theo position để render
      const bannersWithPosition = data.filter((b) => b.position > 0);

      const positionMap: Record<number, BannerItem[]> = {};

      for (const b of bannersWithPosition) {
        if (!positionMap[b.position]) positionMap[b.position] = [];
        positionMap[b.position].push({
          id: b._id,
          _id: b._id,
          image: typeof b.image === "string" ? b.image : b.image?.url || "",
          position: b.position,
          updatedAt: b.updatedAt,
        });
      }

      const uniqueBanners: BannerItem[] = [];

      await Promise.all(
        Object.entries(positionMap).map(async ([posStr, list]) => {
          if (list.length === 1) {
            uniqueBanners.push(list[0]);
          } else {
            const sorted = list.sort(
              (a, b) =>
                new Date(b.updatedAt ?? 0).getTime() -
                new Date(a.updatedAt ?? 0).getTime()
            );
            const [newest, ...rest] = sorted;
            uniqueBanners.push(newest);
            await Promise.all(
              rest.map((oldItem) =>
                bannerService.update(oldItem._id, { position: 0 })
              )
            );
          }
        })
      );

      const initialHolders = uniqueBanners
        .sort((a, b) => a.position - b.position)
        .slice(0, maxSlots)
        .map((b) => ({
          id: b._id,
          _id: b._id,
          image: typeof b.image === "string" ? b.image : b.image?.url || "",
          position: b.position,
        }));

      setHolders(Array.from({ length: maxSlots }, (_, i) => initialHolders[i] || null));
    } catch (err) {
      console.error("Lỗi khi tải banner:", err);
    }
  };


  useEffect(() => {
    fetchBanners();
  }, [selectedTemplate]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = holders.findIndex((h) => h?.id === active.id);
    const toIndex = holders.findIndex((h) => h?.id === over.id);
    if (fromIndex === -1 || toIndex === -1) return;

    const newHolders = [...holders];
    [newHolders[fromIndex], newHolders[toIndex]] = [newHolders[toIndex], newHolders[fromIndex]];
    setHolders(newHolders);
  };

  const handleSlotDoubleClick = async (slotIndex: number) => {
    setActiveSlot(slotIndex);
    try {
      const res = await bannerService.getAll();

      const selectedIds = holders
        .filter((h): h is BannerItem => h !== null)
        .map((h) => h._id);

      const gallery = res.banners.filter((b) => !selectedIds.includes(b._id));

      const galleryItems = gallery.map((b) => ({
        id: b._id,
        _id: b._id,
        image: typeof b.image === "string" ? b.image : b.image?.url || "",
        position: 0,
      }));

      setGalleryImages(galleryItems);
      setShowGallery(true);
    } catch (err) {
      console.error("❌ Lỗi tải gallery:", err);
    }
  };


  const handleImageSelect = (newImage: BannerItem) => {
    if (activeSlot === null) return;
    const newHolders = [...holders];
    newHolders[activeSlot] = { ...newImage };
    setHolders(newHolders);
    setShowGallery(false);
    setActiveSlot(null);
  };

  const handleConfirm = async () => {
    const layoutNum = selectedTemplate === "template1" ? 1 : selectedTemplate === "template2" ? 2 : 3;
    try {
      await Promise.all(
        holders.map((item, index) =>
          item
            ? bannerService.update(item._id, {
              position: index + 1,
              layout: layoutNum as any,
            })
            : null
        )
      );
      toast.success("✅ Đã cập nhật layout và vị trí thành công!");
      await fetchBanners();
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Kéo thả để sắp xếp ảnh</h2>
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Chọn bố cục hiển thị:</label>
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value as any)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="template1">Khung 1: 1 ảnh lớn trái, 2 ảnh nhỏ phải</option>
          <option value="template2">Khung 2: 1 ảnh lớn</option>
          <option value="template3">Khung 3: 4 ảnh nhỏ lướt ngang</option>
        </select>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={holders.map((h) => h?.id || "empty") as string[]} strategy={verticalListSortingStrategy}>
          {selectedTemplate === "template1" && (
            <div className="grid grid-cols-3 gap-4 h-64">
              <div className="col-span-2">
                <SortableImage
                  id={holders[0]?.id || `empty-0`}
                  image={typeof holders[0]?.image === "string" ? holders[0]?.image : holders[0]?.image?.url}
                  onDoubleClick={() => handleSlotDoubleClick(0)}
                />
              </div>
              <div className="flex flex-col gap-4">
                <SortableImage
                  id={holders[1]?.id || `empty-1`}
                  image={typeof holders[1]?.image === "string" ? holders[1]?.image : holders[1]?.image?.url}
                  onDoubleClick={() => handleSlotDoubleClick(1)}
                />
                <SortableImage
                  id={holders[2]?.id || `empty-2`}
                  image={typeof holders[2]?.image === "string" ? holders[2]?.image : holders[2]?.image?.url}
                  onDoubleClick={() => handleSlotDoubleClick(2)}
                />
              </div>
            </div>
          )}

          {selectedTemplate === "template2" && (
            <div className="h-64">
              <SortableImage
                id={holders[0]?.id || `empty-0`}
                image={typeof holders[0]?.image === "string" ? holders[0]?.image : holders[0]?.image?.url}
                onDoubleClick={() => handleSlotDoubleClick(0)}
              />
            </div>
          )}

          {selectedTemplate === "template3" && (
            <div className="grid grid-cols-4 gap-4">
              {holders.map((h, i) => (
                <SortableImage
                  key={i}
                  id={h?.id || `empty-${i}`}
                  image={typeof h?.image === "string" ? h?.image : h?.image?.url}
                  onDoubleClick={() => handleSlotDoubleClick(i)}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>

      <div className="mt-6">
        <button
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
          onClick={handleConfirm}
        >
          Xác nhận sử dụng khung mẫu này cho Trang chủ
        </button>
      </div>

      {showGallery && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow max-w-lg w-[600px] max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">Chọn ảnh</h3>
            <div className="grid grid-cols-5 gap-2">
              {galleryImages.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((img, i) => (
                <img
                  key={img._id}
                  src={typeof img.image === "string" ? img.image : img.image?.url}
                  alt={`img-${i}`}
                  onClick={() => handleImageSelect(img)}
                  className="h-20 object-cover rounded cursor-pointer hover:ring-2 hover:ring-blue-500"
                />
              ))}
            </div>
            <div className="flex justify-between mt-4">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>&larr; Trước</button>
              <span>Trang {currentPage}</span>
              <button
                onClick={() =>
                  setCurrentPage((p) => (p * pageSize < galleryImages.length ? p + 1 : p))
                }
              >
                Sau &rarr;
              </button>
            </div>
            <button
              className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 w-full"
              onClick={() => setShowGallery(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SortableImage({
  id,
  image,
  onDoubleClick,
}: {
  id: string;
  image?: string;
  onDoubleClick?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    height: "100%",
    width: "100%",
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onDoubleClick={onDoubleClick}
      style={style}
      className="rounded-md border border-black bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer aspect-[4/3]"
    >
      {image ? (
        <img src={image} alt="Image" className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center text-gray-400 text-sm">
          <Upload className="h-6 w-6 mb-1" />
          Image
        </div>
      )}
    </div>
  );
}