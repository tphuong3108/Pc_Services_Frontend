"use client";

import { Menu } from "lucide-react";

interface Props {
  onToggleSidebar: () => void;
}

export default function AdminHeader({ onToggleSidebar }: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm z-10 sticky top-0">
      {/* Hamburger menu: shown on small screens only */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden md:hidden p-2 rounded hover:bg-gray-100 text-gray-700 focus:outline-none"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Logo or heading (optional) */}
      <div className="text-lg font-semibold hidden lg:block">Admin Panel Halo</div>

      {/* Fill space */}
      <div className="flex-1" />
    </header>
  );
}
