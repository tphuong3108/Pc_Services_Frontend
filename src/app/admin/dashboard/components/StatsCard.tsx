"use client";

import CountUp from "react-countup";

interface StatsCardProps {
  title: string;
  value: number;
  change: number;
  color: string;
  animate: boolean;
  unit?: "vnd" | "million";
}

export default function StatsCard({ title, value, change, color, animate, unit = "vnd" }: StatsCardProps) {
  const displayValue = unit === "million" ? value / 1_000_000 : value;
  const formatted = unit === "million"
    ? `${displayValue.toFixed(1)}M`
    : displayValue.toLocaleString("vi-VN");

  return (
    <div className={`${color} rounded-2xl p-6 shadow min-w-[140px]`}>
      <h2 className="text-sm text-gray-600 truncate">{title}</h2>
      <p className="text-2xl md:text-3xl font-bold mt-2 break-words truncate">
        {animate ? <CountUp end={displayValue} duration={2} separator="," decimals={unit === "million" ? 1 : 0} /> : formatted}
      </p>
      <span className={`text-sm mt-2 ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
        {change.toFixed(2)}%
      </span>
    </div>
  );
}
