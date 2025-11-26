/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import MonthYearSelector from "./MonthYearSelector";
import UnitSelector from "./UnitSelector";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  open: boolean;
  onClose: () => void;
  leftMonth: number;
  leftYear: number;
  rightMonth: number;
  rightYear: number;
  onChangeLeft: (month: number, year: number) => void;
  onChangeRight: (month: number, year: number) => void;
  leftData: number[];
  rightData: number[];
}

export default function ComparePopup({
  open,
  onClose,
  leftMonth,
  leftYear,
  rightMonth,
  rightYear,
  onChangeLeft,
  onChangeRight,
  leftData,
  rightData,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [unit, setUnit] = useState<"vnd" | "million">("vnd");
  useEffect(() => setMounted(true), []);
  if (!open || !mounted) return null;

  const maxLength = Math.max(leftData.length, rightData.length);
  const chartData = Array.from({ length: maxLength }, (_, i) => ({
    day: (i + 1).toString().padStart(2, "0"),
    [`${leftMonth}/${leftYear}`]: unit === "million" ? (leftData[i] || 0) / 1_000_000 : (leftData[i] || 0),
    [`${rightMonth}/${rightYear}`]: unit === "million" ? (rightData[i] || 0) / 1_000_000 : (rightData[i] || 0),
  }));

  const CustomCompareTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border rounded-md shadow p-2 text-sm space-y-1">
          <p className="font-semibold">Ngày {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name} :{" "}
              {entry.value?.toLocaleString("vi-VN") +
                (entry.name.includes("/") ? "₫" : "")}
            </p>
          ))}
        </div>
      );
    }

    return null;
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl p-8 w-[90vw] max-w-6xl space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">So sánh hai tháng</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-lg">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Dữ liệu gốc</h3>
            <MonthYearSelector
              selectedMonth={leftMonth}
              selectedYear={leftYear}
              onChangeMonth={(m) => onChangeLeft(m, leftYear)}
              onChangeYear={(y) => onChangeLeft(leftMonth, y)}
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Dữ liệu so sánh</h3>
            <MonthYearSelector
              selectedMonth={rightMonth}
              selectedYear={rightYear}
              onChangeMonth={(m) => onChangeRight(m, rightYear)}
              onChangeYear={(y) => onChangeRight(rightMonth, y)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <UnitSelector unit={unit} onChange={setUnit} />
        </div>

        <div className="flex items-center gap-4 pl-2 text-sm font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-2 rounded-sm" style={{ backgroundColor: "#3b82f6" }}></span>
            <span>Tháng {leftMonth}/{leftYear}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-2 rounded-sm" style={{ backgroundColor: "#f59e0b" }}></span>
            <span>Tháng {rightMonth}/{rightYear}</span>
          </div>
        </div>


        <ResponsiveContainer width="100%" height={360}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 50, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickFormatter={(value) => `Ngày ${value}`}
            />

            <YAxis
              tickFormatter={(value) =>
                unit === "million"
                  ? value.toFixed(1) + "M"
                  : value.toLocaleString("vi-VN")
              }
            />
            <Tooltip content={<CustomCompareTooltip />} />

            <Line type="monotone" dataKey={`${leftMonth}/${leftYear}`} stroke="#3b82f6" strokeWidth={3} />
            <Line type="monotone" dataKey={`${rightMonth}/${rightYear}`} stroke="#f59e0b" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
