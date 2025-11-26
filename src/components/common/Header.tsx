"use client";

import { ShoppingCart, Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation"; // ✅ new import
import { useSearch } from "@/hooks/useSearch";
import { Cart } from "@/types/Cart";

export default function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);

  const { handleSearch, loading } = useSearch();
  const pathname = usePathname(); // ✅ detect URL path

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const links = [
    { href: "/user/home", label: "Trang chủ" },
    { href: "/user/product/allproduct?category=all", label: "Sản phẩm" },
    { href: "/user/service", label: "Dịch vụ" },
    { href: "/user/sales", label: "Ưu đãi" },
    { href: "/user/about", label: "Về chúng tôi" },
  ];

  const cartRef = useRef<HTMLDivElement | null>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  // ✅ Handle hover behavior
  const handleMouseEnter = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setCartOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => {
      setCartOpen(false);
    }, 250);
  };

  // ✅ Load cart from localStorage
  useEffect(() => {
    const loadCart = () => {
      const stored = localStorage.getItem("cart");
      if (stored) {
        try {
          const parsed: Cart = JSON.parse(stored);
          setCart(parsed);
          setCartCount(parsed.items.length);
        } catch (err) {
          console.error("Lỗi parse cart:", err);
        }
      } else {
        setCart(null);
        setCartCount(0);
      }
    };

    loadCart();
    const handleCartUpdate = () => loadCart();
    window.addEventListener("cart_updated", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);
    return () => {
      window.removeEventListener("cart_updated", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, []);

  if (!mounted) return null;

  // ✅ Determine which link is active based on current path
  const getActiveLabel = () => {
    if (pathname.includes("/user/product")) return "Sản phẩm";
    if (pathname.includes("/user/service")) return "Dịch vụ";
    if (pathname.includes("/user/sales")) return "Ưu đãi";
    if (pathname.includes("/user/about")) return "Về chúng tôi";
    return "Trang chủ";
  };

  const activeLabel = getActiveLabel();

  return (
    <header className="w-full shadow bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* 📱 Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setOpenMenu(true)}>
            <Menu size={22} />
          </button>
        </div>

        {/* 🖥️ Logo */}
        <div className="text-lg font-semibold hidden sm:block lg:pl-0 px-4">
          <Link href="/user/home">DuDi Computer</Link>
        </div>

        {/* 🧭 Desktop Nav */}
        {mounted && (
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`pb-1 px-1 transition-all 
                ${activeLabel === link.label
                    ? "font-semibold text-blue-600 border-b-2 border-blue-600"
                    : "font-semibold hover:text-blue-700 hover:border-b-2 hover:border-blue-600"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
        {/* 🔍 Search */}
        <div className="flex-1 mx-3 hidden sm:flex">
          <div className="bg-gray-100 flex items-center w-full rounded">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch(searchQuery);
              }}
              placeholder="Tìm kiếm..."
              className="flex-1 px-3 py-2 text-sm bg-gray-100 outline-none"
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              className="px-3"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 border-t-2 border-black rounded-full" />
              ) : (
                <Search size={18} />
              )}
            </button>
          </div>
        </div>

        {/* 🧩 Right Icons */}
        <div className="flex items-center gap-4">
          {/* 🛒 Cart */}
          <div
            ref={cartRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className="relative hover:text-gray-600 group"
              onClick={() => (window.location.href = "/user/cart")}
            >
              <ShoppingCart
                size={20}
                className="transition-transform duration-200 group-hover:scale-125"
              />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                  {cartCount}
                </span>
              )}
            </button>

            {/* 💬 Popup */}
            {cartOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg z-50 p-4">
                <h4 className="font-semibold mb-2">Giỏ hàng</h4>
                {cart && cart.items.length > 0 ? (
                  <ul className="max-h-40 overflow-auto divide-y divide-gray-100">
                    {cart.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between py-1 text-sm"
                      >
                        <span>{item.name}</span>
                        <span>x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500 text-sm">Giỏ hàng trống</div>
                )}
                <button
                  className="mt-3 w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700 transition"
                  onClick={() => (window.location.href = "/user/cart")}
                >
                  Xem giỏ hàng
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 📱 Mobile Drawer */}
      {openMenu && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="bg-black/40 absolute inset-0"
            onClick={() => setOpenMenu(false)}
          />
          <div className="w-64 bg-white absolute left-0 top-0 h-full shadow-lg z-50 p-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold">Menu</h3>
              <button onClick={() => setOpenMenu(false)}>
                <X size={22} />
              </button>
            </div>

            <nav className="flex flex-col gap-4 mt-4 text-sm">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpenMenu(false)}
                  className={`${activeLabel === link.label
                    ? "text-blue-600 underline"
                    : "hover:underline"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Search */}
            <div className="mt-6">
              <div className="bg-gray-100 flex items-center w-full rounded">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch(searchQuery);
                  }}
                  placeholder="Tìm kiếm..."
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 outline-none"
                />
                <button
                  onClick={() => handleSearch(searchQuery)}
                  className="px-3"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin h-4 w-4 border-t-2 border-black rounded-full" />
                  ) : (
                    <Search size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
