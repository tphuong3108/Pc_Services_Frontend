"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { productService } from "@/services/product.service";
import { Product } from "@/types/Product";
import { Rating } from "@/types/Rating";
import { ratingService } from "@/services/rating.service";

import ProductBreadcrumb from "./components/ProductBreadcrumb";
import ProductGallery from "./components/ProductGallery";
import ProductInfo from "./components/ProductInfo";
import ProductDescription from "./components/ProductDescription";
import ProductSpecs from "./components/ProductSpecs";
import ProductReviewSection from "./components/ProductReviewSection";
import ProductSample from "./components/ProductSample";
import CategoryNav from "@/components/common/CategoryNav";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Rating[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [score, setScore] = useState(5);

  const reviewFormRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getById(id as string);
        setProduct(data);
      } catch (err) {
        console.error("Lỗi khi tải chi tiết sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    const countView = async () => {
      try {
        if (product && product._id) {
          await productService.countViewRedis(product._id);
          const ratingData = await ratingService.getByProductId(product._id);
          if (ratingData && ratingData.ratings) {
            setRatings(ratingData.ratings || [0]);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tăng view hoặc lấy đánh giá:", err);
      }
    };
    if (id && product) countView();
  }, [id, product]);

  if (loading) return <p className="text-center py-10">Đang tải...</p>;
  if (!product)
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-gray-500">Sản phẩm không tồn tại.</p>
      </div>
    );

  const oldPrice = Math.round(product.price * 1.2);

  // Gửi đánh giá
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        product_id: product._id,
        name,
        comment,
        score,
      };
      const createdRating = await ratingService.create(payload);
      setName("");
      setComment("");
      setScore(5);
      const updated = await ratingService.getByProductId(product._id);
      setRatings(updated.ratings || []);
      alert("Đánh giá đã được gửi!");
    } catch (err) {
      console.error("Lỗi gửi đánh giá:", err);
      alert("Gửi đánh giá thất bại.");
    }
  };

  return (
    <>
      <CategoryNav
        selectedCategory={
          typeof product.category_id === "object"
            ? product.category_id.name
            : (product.category_id as string)
        }
        onSelectCategory={() => {}}
      />
      <ProductBreadcrumb
        category={
          typeof product.category_id === "object"
            ? product.category_id.name
            : (product.category_id as string)
        }
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <ProductGallery
            product={{
              img: product.images?.[0]?.url || "/images/placeholder.png",
              title: product.name,
              gallery: product.images?.map((i) => i.url) || [],
            }}
          />
          <ProductInfo
            product={{
              id: product._id,
              title: product.name,
              rating:
                ratings.length > 0
                  ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
                  : 5.0,
              reviews: ratings.length,
              quantity: product.quantity,
              oldPrice,
              price: product.price,
              discount: `${Math.round(
                ((oldPrice - product.price) / oldPrice) * 100
              )}%`,
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">
          <ProductDescription
            description={product.description || "Chưa có mô tả."}
          />
          <ProductSpecs
            product={{
              brand: product.brand || "Đang cập nhật",
              model: product.model || "Đang cập nhật",
              size: product.size || "Đang cập nhật",
              resolution: product.resolution || "Đang cập nhật",
              panel: product.panel || "Đang cập nhật",
              ports: Array.isArray(product.ports)
                ? product.ports
                : typeof product.ports === "string"
                ? [product.ports]
                : ["Đang cập nhật"],
            }}
          />
        </div>

        <ProductReviewSection productId={product._id} scrollToFormRef={reviewFormRef} />

        {/* ✅ Form đánh giá mới */}
        <div className="mt-12 border-t pt-8">
          <h3 className="text-xl font-semibold mb-4">Đánh giá sản phẩm</h3>
          <form ref={reviewFormRef} onSubmit={handleSubmitReview} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium mb-1">Tên</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bình luận</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={4}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Đánh giá sao</label>
              <select
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                required
                className="w-full border px-3 py-2 rounded"
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <option key={s} value={s}>
                    {s} sao
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Gửi đánh giá
            </button>
          </form>
        </div>

        <ProductSample productId={product._id} />
      </div>
    </>
  );
}
