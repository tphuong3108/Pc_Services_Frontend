"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useRef, RefObject } from "react";
import { ratingService } from "@/services/rating.service";
import { Rating } from "@/types/Rating";
import bannerImg from "@/assets/image/banner/bannerdetailproduct.png"; // hoặc ảnh banner dịch vụ

interface ServiceReviewSectionProps {
    serviceId: string;
    scrollToFormRef: RefObject<HTMLFormElement | null>;
}

export default function ServiceReviewSection({
    serviceId,
    scrollToFormRef,
}: ServiceReviewSectionProps) {
    const [loading, setLoading] = useState(true);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const reviewFormRef = useRef<HTMLDivElement>(null);

    const calculateAverageRating = () => {
        if (ratings.length === 0) return 0;
        const total = ratings.reduce((sum, r) => sum + r.score, 0);
        return total / ratings.length;
    };

    const starCounts = [1, 2, 3, 4, 5].reduce((acc, star) => {
        acc[star] = ratings.filter((r) => r.score === star).length;
        return acc;
    }, {} as Record<number, number>);

    const totalRatings = ratings.length;

    const getPercentage = (star: number) =>
        ((starCounts[star] || 0) / totalRatings) * 100;

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const data = await ratingService.getByServiceId(serviceId);
                setRatings(Array.isArray(data) ? data : data.ratings || []);
            } catch (err) {
                console.error("Lỗi khi tải đánh giá:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRatings();
    }, [serviceId]);

    if (loading)
        return <p className="text-center py-10">Đang tải đánh giá dịch vụ...</p>;

    if (ratings.length === 0)
        return (
            <div className="max-w-7xl mx-auto px-4 mt-16">
                <p className="text-gray-500">Chưa có đánh giá nào cho dịch vụ này.</p>
            </div>
        );

    return (
        <div className="max-w-7xl mx-auto px-4 mt-16">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold uppercase">Đánh giá dịch vụ</h2>
                <button className="text-blue-600 text-sm hover:underline">
                    Xem tất cả
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tổng quan đánh giá */}
                <div className="border rounded-lg p-6 shadow-sm">
                    <h3 className="font-semibold mb-2">Tổng quan</h3>
                    <div className="flex items-center gap-1 text-yellow-400 mb-4">
                        {Array.from({ length: Math.round(calculateAverageRating()) }).map(
                            (_, i) => (
                                <Star key={i} className="w-5 h-5 fill-yellow-400" />
                            )
                        )}
                    </div>

                    {/* Progress theo số sao */}
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                                <span className="w-10">{star} sao</span>
                                <div className="flex-1 h-2 bg-gray-200 rounded">
                                    <div
                                        className="h-2 bg-green-500 rounded"
                                        style={{
                                            width: `${getPercentage(star).toFixed(0)}%`,
                                        }}
                                    ></div>
                                </div>
                                <span className="w-10 text-gray-600">
                                    {getPercentage(star).toFixed(0)}%
                                </span>
                            </div>
                        ))}
                    </div>

                    <p className="text-sm text-gray-500 mt-4">
                        Hãy chia sẻ trải nghiệm của bạn để giúp người khác lựa chọn dịch vụ
                        phù hợp.
                    </p>
                    <button
                        onClick={() => {
                            scrollToFormRef?.current?.scrollIntoView({
                                behavior: "smooth",
                            });
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
                    >
                        Viết đánh giá
                    </button>

                    <div ref={reviewFormRef}></div>
                </div>

                {/* Danh sách đánh giá */}
                <div className="lg:col-span-2 space-y-4">
                    {ratings.map((review) => (
                        <div
                            key={review._id}
                            className="border rounded-lg p-4 shadow-sm bg-white"
                        >
                            <div className="flex justify-between text-sm text-gray-500 mb-2">
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.round(review.score)
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300"
                                                }`}
                                        />
                                    ))}
                                    <span className="ml-2 font-medium">
                                        {review.score.toFixed(2)}
                                    </span>
                                </div>
                                <span>
                                    {review.created_at
                                        ? new Date(review.created_at).toLocaleDateString("vi-VN")
                                        : ""}
                                    {" • "}
                                    <span>{review.name}</span>
                                </span>
                            </div>

                            <p className="text-gray-700">{review.comment}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Banner cuối trang */}
            <div className="mt-10 relative rounded-lg overflow-hidden h-86 bg-gradient-to-r from-[#A0B3F8] to-[#A978D6]">
                <Image
                    src={bannerImg}
                    alt="Dịch vụ sửa chữa"
                    className="absolute right-0 bottom-0 h-full object-contain"
                />

                <div className="absolute inset-0 flex flex-col justify-center items-end p-12">
                    <h3 className="text-xl font-semibold text-white mb-3 max-w-md text-right">
                        Dịch vụ sửa chữa tại <br />
                        nhà chỉ cần 1 cú click
                    </h3>
                    <button className="bg-blue-600 text-white px-12 py-3 mr-8 rounded-lg hover:opacity-90 transition">
                        Bắt đầu ngay
                    </button>
                </div>
            </div>
        </div>
    );
}
