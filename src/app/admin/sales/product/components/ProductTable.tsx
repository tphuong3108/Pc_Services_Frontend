/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Product, UploadedImage } from "@/types/Product";
import { Discount } from "@/types/Discount";
import { productService } from "@/services/product.service";
import { searchProducts } from "@/services/search.service";
import { categoryService } from "@/services/category.service";
import { discountService } from "@/services/discount.service";

import ProductTableHeader from "./ProductTableHeader";
import ProductSearchInput from "@/components/admin/products/ProductSearchInput";
import ProductTableBody from "./ProductTableBody";
import ProductFormModal from "./ProductFormModal";
import ProductTablePagination from "@/components/admin/products/ProductTablePagination";

import { Category } from "@/types/Category";
import { toast } from "react-toastify";
import { showConfirmToast } from "@/components/common/ConfirmToast";

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
    }, [currentPage, itemsPerPage, searchQuery]);

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
                data = await productService.getAll(itemsPerPage, currentPage);
            }
            if (latestFetch.current !== current) return;

            setProducts(data.products);
            setTotalProducts(data.total);
            // discount 
            // const discountResults = await Promise.all(
            //     data.products.map((p: Product) =>
            //         discountService.getDiscountById('product', p._id).catch(() => null)
            //     )
            // );
            // const discountMap: Record<string, Discount | null> = {};
            // data.products.forEach((p: Product, idx: number) => {
            //     discountMap[p._id] = discountResults[idx];
            // });
            // setDiscounts(discountMap);
        } catch (err) {
            console.error("Error fetching products", err);
            setProducts([]);
            setTotalProducts(0);
        } finally {
            setLoading(false);
        }
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
                            <th className="p-2">Tên</th>
                            {/* <th className="p-2">Mô tả</th> */}
                            <th className="p-2">Giá gốc</th>
                            <th className="p-2">Giảm giá</th>
                            <th className="p-2">Giá đã giảm</th>
                            <th className="p-2">Danh mục</th>
                            <th className="p-2">Số lượng</th>
                            <th className="p-2">Trạng thái</th>
                            <th className="p-2 ">Thao tác</th>
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
                            toast.success(editingProduct ? "Cập nhật thành công!" : "Thêm mới thành công!");
                            setShowForm(false);
                            //await fetchProducts(); // Chỉ cần gọi lại hàm này!
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