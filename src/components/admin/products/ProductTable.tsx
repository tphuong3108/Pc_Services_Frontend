/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Product, UploadedImage } from "@/types/Product";
import { Discount } from "@/types/Discount";
import { productService } from "@/services/product.service";
import { searchProducts } from "@/services/search.service";
import { categoryService } from "@/services/category.service";
import { discountService } from "@/services/discount.service";

import ProductTableHeader from "@/components/admin/products/ProductTableHeader";
import ProductSearchInput from "@/components/admin/products/ProductSearchInput";
import ProductTableBody from "@/components/admin/products/ProductTableBody";
import ProductFormModal from "@/components/admin/products/ProductFormModal";
import ProductTablePagination from "@/components/admin/products/ProductTablePagination";

import { Category } from "@/types/Category";
import { toast } from "react-toastify";
import { showConfirmToast } from "@/components/common/ConfirmToast";
import { ChevronUp, ChevronDown } from "lucide-react";

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
    quantity?: number;
    status?: "available" | "out_of_stock" | "hidden";
    brand?: string;
    category_id?: string;
    images?: (File | UploadedImage)[];
};

export default function ProductTable() {
    const [products, setProducts] = useState<Product[]>([]);
    const [discounts, setDiscounts] = useState<Record<string, Discount | null>>({});
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<Record<string, 1 | -1>>({ updatedAt: -1 });

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalProducts, setTotalProducts] = useState(0);

    const [searchQuery, setSearchQuery] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<ProductFormData>({
        images: [],
        status: "available",
    });

    const latestFetch = useRef(0);
    const totalPages = Math.max(1, Math.ceil(totalProducts / itemsPerPage));

    useEffect(() => {
        const updateItemsPerPage = () => {
            setItemsPerPage(window.innerWidth < 1024 ? 5 : 10);
        };
        updateItemsPerPage();
        window.addEventListener("resize", updateItemsPerPage);
        return () => window.removeEventListener("resize", updateItemsPerPage);
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [currentPage, itemsPerPage, searchQuery, order]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const current = Date.now();
            latestFetch.current = current;
            let data;

            if (searchQuery.trim()) {
                data = await searchProducts(searchQuery, itemsPerPage, currentPage);
            } else {
                const options: any = {};
                if (Object.keys(order).length > 0) {
                    options.order = order;
                }
                data = await productService.getAll(itemsPerPage, currentPage, { status: { $ne: "hidden" } }, '', options.order);
            }

            if (latestFetch.current !== current) return;
            setProducts(data.products);
            setTotalProducts(data.total);
        } catch (err) {
            console.error("Error fetching products", err);
            setProducts([]);
            setTotalProducts(0);
        } finally {
            setLoading(false);
        }
    };

    const toggleorder = (field: string) => {
        setOrder((prev) => {
            const currentDir = prev[field] ?? 1;
            return { [field]: currentDir === 1 ? -1 : 1 }; // Chỉ giữ duy nhất 1 field đang được order
        });
    };

    const renderSortIcons = (field: string) => {
        const direction = order[field];

        return (
            <span className="flex flex-col justify-center ml-1 leading-tight">
                <ChevronUp
                    size={12}
                    className={`${direction === 1 ? "text-blue-600" : "text-gray-400"}`}
                    style={{ lineHeight: 0 }}
                />
                <ChevronDown
                    size={12}
                    className={`${direction === -1 ? "text-blue-600" : "text-gray-400"}`}
                    style={{ lineHeight: 0 }}
                />
            </span>
        );
    };

    const fetchCategories = async () => {
        try {
            const data = await categoryService.getAll(100, 1);
            setCategories(
                data.categories.map((cat: any) => ({
                    ...cat,
                    tags: cat.tags ?? [],
                }))
            );
        } catch (err) {
            console.error("Error fetching categories", err);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);

        setFormData((prev) => {
            const current = prev.images || [];
            if (current.length + newFiles.length > 3) {
                toast.warning("Chỉ được phép upload tối đa 3 ảnh!");
                return { ...prev, images: current.slice(0, 3) };
            }
            return { ...prev, images: [...current, ...newFiles].slice(0, 3) };
        });
    };

    const removeImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index),
        }));
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirmToast({ message: "Bạn có chắc muốn xóa sản phẩm này?" });
        if (!confirmed) return;

        try {
            await productService.delete(id);
            setProducts((prev) => prev.filter((p) => p._id !== id));
            toast.success("Đã xóa sản phẩm.");
        } catch (err) {
            console.error("Delete failed", err);
            toast.error("❌ Xóa sản phẩm thất bại.");
        }
    };
    const updateDiscountForProduct = async (productId: string) => {
        const discount = await discountService.getDiscountById('product', productId);
        setDiscounts((prev) => ({
            ...prev,
            [productId]: discount,
        }));
    };

    return (
        <div className="bg-white shadow rounded p-4">
            <ProductTableHeader
                onAddProduct={() => {
                    setEditingProduct(null);
                    setFormData({ images: [], status: "available" });
                    setShowForm(true);
                }}
                // excel
                onExport={async () => {
                    try {
                        toast.info("⏳ Đang xuất file Excel...");

                        const blob = await productService.exportProductsToExcel();
                        const url = window.URL.createObjectURL(new Blob([blob]));
                        const link = document.createElement("a");
                        link.href = url;
                        link.setAttribute(
                            "download",
                            `Danh_sach_san_pham_${new Date().toISOString().split("T")[0]}.xlsx`
                        );
                        document.body.appendChild(link);
                        link.click();
                        link.remove();

                        toast.success("✅ Xuất file Excel thành công!");
                    } catch (error) {
                        console.error("❌ Lỗi khi xuất Excel:", error);
                        toast.error("Xuất file thất bại!");
                    }
                }}
            />

            <ProductSearchInput
                query={searchQuery}
                onChange={(value: string) => {
                    setSearchQuery(value);
                }}
            />
            <p className="text-sm text-gray-600 mb-2">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalProducts)} từ {totalProducts}
            </p>
            <div className="overflow-x-auto">
                <table className="w-full table-auto text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2">Ảnh</th>
                            <th
                                className="p-2 cursor-pointer select-none text-center whitespace-nowrap"
                                onClick={() => toggleorder("name")}
                            >
                                <div className="inline-flex items-center justify-center gap-1">
                                    <span className="font-semibold">Tên</span>
                                    {renderSortIcons("name")}
                                </div>
                            </th>
                            <th
                                className="p-2 cursor-pointer select-none text-center whitespace-nowrap"
                                onClick={() => toggleorder("price")}
                            >
                                <div className="inline-flex items-center justify-center gap-1">
                                    <span className="font-semibold">Giá gốc</span>
                                    {renderSortIcons("price")}
                                </div>
                            </th>
                            <th className="p-2">Giảm giá</th>
                            <th className="p-2">Giá đã giảm</th>
                            <th className="p-2">Danh mục</th>
                            <th className="p-2">Số lượng</th>
                            <th
                                className="p-2 cursor-pointer select-none text-center whitespace-nowrap"
                                onClick={() => toggleorder("status")}
                            >
                                <div className="inline-flex items-center justify-center gap-1">
                                    <span className="font-semibold">Trạng thái</span>
                                    {renderSortIcons("status")}
                                </div>
                            </th>
                            <th className="p-2">Thao tác</th>
                        </tr>
                    </thead>

                    <ProductTableBody
                        products={products}
                        loading={loading}
                        onEdit={(p) => {
                            setEditingProduct(p);
                            setFormData({
                                name: p.name,
                                slug: p.slug,
                                tags: p.tags,
                                ports: p.ports,
                                panel: p.panel,
                                resolution: p.resolution,
                                size: p.size,
                                model: p.model,
                                description: p.description,
                                price: p.price,
                                quantity: p.quantity,
                                status: p.status,
                                brand: p.brand,
                                category_id:
                                    typeof p.category === "object" ? p.category._id : p.category,
                                images: p.images,
                            });
                            setShowForm(true);
                        }}
                        onDelete={handleDelete}
                    />
                </table>
            </div>

            <ProductTablePagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />

            {showForm && (
                <ProductFormModal
                    categories={categories}
                    editingProduct={editingProduct}
                    show={showForm}
                    onClose={() => {
                        setShowForm(false);
                        setEditingProduct(null);
                        setFormData({ images: [], status: "available" });
                    }}
                    formData={formData}
                    setFormData={setFormData}
                    handleImageChange={handleImageChange}
                    removeImage={removeImage}
                    updateDiscountForProduct={updateDiscountForProduct}
                    onSuccess={() => {
                        fetchProducts();
                    }}
                    onSubmit={async (productData: Partial<Product>) => {
                        try {
                            // Normalize productData to API shape: convert Date fields (like start_date) to ISO strings
                            const apiData: any = { ...productData };
                            if (apiData.start_date instanceof Date) {
                                apiData.start_date = apiData.start_date.toISOString();
                            }

                            if (editingProduct) {
                                await productService.update(editingProduct._id, apiData);
                            } else {
                                await productService.create(apiData);
                            }
                            // toast.success(editingProduct ? "Cập nhật thành công!" : "Thêm mới thành công!");
                            setShowForm(false);
                            setEditingProduct(null);
                            setFormData({ images: [], status: "available" });
                        } catch (err) {
                            console.error("Save failed", err);
                            toast.error("❌ Lưu sản phẩm thất bại.");
                        }
                    }}
                />
            )}
        </div>
    );
}