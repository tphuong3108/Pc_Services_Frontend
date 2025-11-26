/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import TableHeader from "@/components/admin/TableHeader";
import Button from "@/components/common/Button";
import StatsCard from "@/app/admin/dashboard/components/StatsCard";
import MonthYearSelector from "@/app/admin/dashboard/components/MonthYearSelector";
import ChartLegend from "@/app/admin/dashboard/components/ChartLegend";
import ChartTabs from "@/app/admin/dashboard/components/ChartTabs";
import ComparePopup from "@/app/admin/dashboard/components/ComparePopup";
import UnitSelector from "@/app/admin/dashboard/components/UnitSelector";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { statsService } from "@/services/stats.service";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { toast } from "react-toastify";

export default function DashboardPage() {
  const today = new Date().toISOString().split("T")[0];
  const [animate, setAnimate] = useState(true);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const defaultSelectedMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const defaultSelectedYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const [monthlyProfit, setMonthlyProfit] = useState<number[]>([]);
  const [selectedMonthData, setSelectedMonthData] = useState<number[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(defaultSelectedMonth);
  const [selectedYear, setSelectedYear] = useState(defaultSelectedYear);

  const [products, setProducts] = useState(0);
  const [orderRequests, setOrderRequests] = useState(0);
  const [repairRequests, setRepairRequests] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);

  const [previousMonthProfit, setPreviousMonthProfit] = useState(0);
  const [previousMonthOrders, setPreviousMonthOrders] = useState(0);
  const [previousMonthRepairs, setPreviousMonthRepairs] = useState(0);
  const [previousMonthProducts, setPreviousMonthProducts] = useState(0);

  const [todayProfit, setTodayProfit] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [completedRepairs, setCompletedRepairs] = useState(0);
  const [todayRepairs, setTodayRepairs] = useState(0);
  const [soldProducts, setSoldProducts] = useState(0);

  const [tab, setTab] = useState<"monthly" | "full">("monthly");
  const [displayUnit, setDisplayUnit] = useState<"vnd" | "million">("vnd");


  const [showCompare, setShowCompare] = useState(false);
  const [compareLeftMonth, setCompareLeftMonth] = useState(currentMonth);
  const [compareLeftYear, setCompareLeftYear] = useState(currentYear);
  const [compareRightMonth, setCompareRightMonth] = useState(selectedMonth);
  const [compareRightYear, setCompareRightYear] = useState(selectedYear);
  const [compareLeftData, setCompareLeftData] = useState<number[]>([]);
  const [compareRightData, setCompareRightData] = useState<number[]>([]);



  const daysInMonth = (year: number, month: number) =>
    new Date(year, month, 0).getDate();

  const getSampledDays = (totalDays: number, segments = 6): number[] => {
    const step = Math.floor((totalDays / segments) - 0.5);
    const sampled = Array.from({ length: segments }, (_, i) => i * step + 1);
    if (!sampled.includes(totalDays)) sampled.push(totalDays);
    return Array.from(new Set(sampled)).sort((a, b) => a - b);
  };

  const safeChange = (curr: number, prev: number) =>
    prev === 0 ? (curr > 0 ? 100 : 0) : ((curr / prev - 1) * 100);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchCurrentMonthLine();
    fetchSelectedMonthLine();
    fetchStatsToday();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const previousMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const previousYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
    statsService.getStatsByMonth(previousMonth, previousYear)
      .then((stats) => {
        const profitSum = stats.reduce((sum, s) => sum + (s.total_profit || 0), 0);
        const orders = stats.reduce((sum, s) => sum + (s.total_orders || 0), 0);
        const repairs = stats.reduce((sum, s) => sum + (s.total_repairs || 0), 0);
        const sold = stats.reduce((sum, s) => sum + (s.total_products || 0), 0);
        setPreviousMonthProfit(profitSum);
        setPreviousMonthOrders(orders);
        setPreviousMonthRepairs(repairs);
        setPreviousMonthProducts(sold);
      })
      .catch((err) => {
        console.error("Lỗi lấy thống kê tháng trước:", err);
        setPreviousMonthProfit(0);
        setPreviousMonthOrders(0);
        setPreviousMonthRepairs(0);
        setPreviousMonthProducts(0);
      });
  }, [selectedMonth, selectedYear]);

  const fetchCurrentMonthLine = async () => {
    const totalDays = daysInMonth(currentYear, currentMonth);
    const promises = Array.from({ length: totalDays }, (_, i) => {
      const dateStr = new Date(currentYear, currentMonth - 1, i + 1)
        .toISOString()
        .split("T")[0];
      return statsService.getStatsByDate(dateStr).catch(() => ({ total_profit: 0 }));
    });

    const results = await Promise.all(promises);
    setMonthlyProfit(results.map(r => r.total_profit || 0));
  };

  const fetchSelectedMonthLine = async () => {
    const totalDays = daysInMonth(selectedYear, selectedMonth);
    const profits: number[] = [];
    let profitSum = 0;
    let orders = 0;
    let repairs = 0;
    let sold = 0;

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = new Date(selectedYear, selectedMonth - 1, d)
        .toISOString()
        .split("T")[0];
      try {
        const stat = await statsService.getStatsByDate(dateStr);
        profits.push(stat.total_profit || 0);
        profitSum += stat.total_profit || 0;
        orders += stat.total_orders || 0;
        repairs += stat.total_repairs || 0;
        sold += stat.total_products || 0;
      } catch {
        profits.push(0);
      }
    }

    setSelectedMonthData(profits);
    setTotalProfit(profitSum);
    setOrderRequests(orders);
    setRepairRequests(repairs);
    setProducts(sold);
  };

  const fetchStatsToday = async () => {
    try {
      const todayStat = await statsService.getCurrentStats();
      setTodayProfit(todayStat.total_profit || 0);
      setCompletedOrders(todayStat.completed_orders || 0);
      setTodayOrders(todayStat.total_orders || 0);
      setCompletedRepairs(todayStat.completed_repairs || 0);
      setTodayRepairs(todayStat.total_repairs || 0);
      setSoldProducts(todayStat.total_products || 0);
    } catch (err) {
      console.error("Lỗi lấy thống kê hôm nay:", err);
    }
  };

  const totalStats = [
    {
      title: "Doanh thu theo tháng",
      value: totalProfit,
      change: safeChange(totalProfit, monthlyProfit.reduce((a, b) => a + b, previousMonthProfit)),
      color: "bg-blue-100 text-blue-800",
    },
    {
      title: "Tổng đơn đặt hàng",
      value: orderRequests,
      change: safeChange(orderRequests, previousMonthOrders),
      color: "bg-green-100 text-green-800",
    },
    {
      title: "Tổng yêu cầu sửa chữa",
      value: repairRequests,
      change: safeChange(repairRequests, previousMonthRepairs),
      color: "bg-red-100 text-red-800",
    },
    {
      title: "Tổng sản phẩm đã bán",
      value: products,
      change: safeChange(products, previousMonthProducts),
      color: "bg-yellow-100 text-yellow-800",
    },
  ];

  const todayStats = [
    {
      title: "Doanh thu hôm nay",
      value: todayProfit,
      change: safeChange(todayProfit, 0),
      color: "bg-blue-100 text-blue-800",
    },
    {
      title: "Đơn hàng hoàn thành trong ngày",
      value: completedOrders,
      change: 100 + safeChange(completedOrders, todayOrders),
      color: "bg-green-100 text-green-800",
    },
    {
      title: "Yêu cầu sửa chữa xong trong ngày",
      value: completedRepairs,
      change: 100 + safeChange(completedRepairs, todayRepairs),
      color: "bg-red-100 text-red-800",
    },
    {
      title: "Số sản phẩm bán trong ngày",
      value: soldProducts,
      change: safeChange(soldProducts, 0),
      color: "bg-yellow-100 text-yellow-800",
    },
  ];

  const totalDays = daysInMonth(selectedYear, selectedMonth);
  const days =
    tab === "monthly"
      ? getSampledDays(totalDays)
      : Array.from({ length: totalDays }, (_, i) => i + 1);

  const chartData = days.map((day) => ({
    name: day.toString().padStart(2, "0"),
    "Tháng này": monthlyProfit[day - 1] || 0,
    [`Tháng ${selectedMonth}`]: selectedMonthData[day - 1] || 0,
  }));

  const fetchCompareMonthLine = async (month: number, year: number, side: "left" | "right") => {
    const totalDays = daysInMonth(year, month);
    const profits: number[] = [];

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = new Date(year, month - 1, d).toISOString().split("T")[0];
      try {
        const stat = await statsService.getStatsByDate(dateStr);
        profits.push(stat.total_profit || 0);
      } catch {
        profits.push(0);
      }
    }

    if (side === "left") setCompareLeftData(profits);
    else setCompareRightData(profits);
  };

  useEffect(() => {
    if (showCompare) {
      fetchCompareMonthLine(compareLeftMonth, compareLeftYear, "left");
      fetchCompareMonthLine(compareRightMonth, compareRightYear, "right");
    }
  }, [compareLeftMonth, compareLeftYear, compareRightMonth, compareRightYear, showCompare]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border rounded-md shadow p-2 text-sm space-y-1">
          <p className="font-semibold">Ngày {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name} :{" "}
              {displayUnit === "million"
                ? (entry.value / 1_000_000).toFixed(1) + " triệu"
                : entry.value.toLocaleString("vi-VN") + "₫"}
            </p>
          ))}
        </div>
      );
    }

    return null;
  };
  
  return (
    <div className="p-6 space-y-6">
      <TableHeader
        title="Thống kê"
        breadcrumb={["Admin", "Thống kê - báo cáo"]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  const chartElement = document.querySelector(".chart-container") as HTMLElement;

                  if (!chartElement) {
                    console.log("Không tìm thấy class");
                    toast.error("Không tìm thấy biểu đồ để xuất PDF!");
                    return;
                  }

                  toast.info("⏳ Đang tạo file PDF...");

                  const dataUrl = await toPng(chartElement, {
                    cacheBust: true,
                    quality: 1,
                    backgroundColor: "#ffffff",
                  });

                  const pdf = new jsPDF("l", "mm", "a4");
                  const pdfWidth = pdf.internal.pageSize.getWidth();
                  const pdfHeight = pdf.internal.pageSize.getHeight();

                  pdf.setFont("Helvetica", "bold");
                  pdf.setFontSize(20);
                  pdf.text("Báo cáo doanh thu", pdfWidth / 2, 20, { align: "center" });

                  pdf.setFont("Helvetica", "normal");
                  pdf.setFontSize(12);
                  pdf.text(`Ngày in báo cáo: ${new Date().toLocaleDateString("vi-VN")}`, 20, 35);

                  const chartTop = 45;
                  const chartHeight = pdfHeight - chartTop - 10;
                  pdf.addImage(dataUrl, "PNG", 10, chartTop, pdfWidth - 20, chartHeight);

                  const fileName = `Thong_ke_${new Date().toISOString().split("T")[0]}.pdf`;
                  pdf.save(fileName);

                  console.log("Xuất thành công");
                  toast.success("✅ Xuất file PDF thành công!");
                } catch (error) {
                  console.error("❌ Lỗi khi xuất PDF:", error);
                  toast.error("Xuất file thất bại!");
                }
              }}
            >
              📤 Xuất file PDF
            </Button>

            <Button onClick={() => setShowCompare(true)}>📊 So sánh</Button>
          </div>
        }

      />

      <div className="flex flex-wrap justify-between items-center gap-4">
        <MonthYearSelector
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onChangeMonth={setSelectedMonth}
          onChangeYear={setSelectedYear}
        />
        <UnitSelector unit={displayUnit} onChange={setDisplayUnit} />
      </div>

      <div className="chart-container ">
        {/* Tổng tháng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-[50px]">
          {totalStats.map((s) => (
            <StatsCard
              key={s.title}
              {...s}
              animate={animate}
              unit={s.title.includes("Doanh thu") ? displayUnit : undefined}
            />
          ))}

        </div>

        {/* Hôm nay */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-[50px]">
          {todayStats.map((s) => (
            <StatsCard
              key={s.title}
              {...s}
              animate={animate}
              unit={s.title.includes("Doanh thu") ? displayUnit : undefined}
            />
          ))}

        </div>

        <ChartTabs tab={tab} onChange={setTab} />

        {/* Biểu đồ */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">

            <ChartLegend selectedMonth={selectedMonth} />
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: 10 }}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis
                dataKey="name"
                tickFormatter={(value) => `Ngày ${value}`}
                tick={{ fontSize: 12, fill: "#666" }}
                angle={0}
                dy={10}
              />
              <YAxis
                tickFormatter={(value) =>
                  displayUnit === "million"
                    ? (value / 1_000_000).toFixed(1) + "M"
                    : value.toLocaleString("vi-VN")
                }
              />
              <Tooltip content={<CustomTooltip />} />


              <Line type="monotone" dataKey="Tháng này" stroke="#2563EB" strokeWidth={3} />
              <Line type="monotone" dataKey={`Tháng ${selectedMonth}`} stroke="#F59E0B" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>

          <ComparePopup
            open={showCompare}
            onClose={() => setShowCompare(false)}
            leftMonth={compareLeftMonth}
            leftYear={compareLeftYear}
            rightMonth={compareRightMonth}
            rightYear={compareRightYear}
            onChangeLeft={(m: number, y: number) => {
              setCompareLeftMonth(m);
              setCompareLeftYear(y);
            }}
            onChangeRight={(m: number, y: number) => {
              setCompareRightMonth(m);
              setCompareRightYear(y);
            }}
            leftData={compareLeftData}
            rightData={compareRightData}
          />

        </div>
      </div>
    </div>
  );
}
