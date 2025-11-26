"use client";


interface ChartTabsProps {
    tab: "monthly" | "full";
    onChange: (tab: "monthly" | "full") => void;
}


export default function ChartTabs({ tab, onChange }: ChartTabsProps) {
    return (
        <div className="flex gap-4">
            <button
                onClick={() => onChange("monthly")}
                className={`px-4 py-2 rounded ${tab === "monthly" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
                Theo tháng
            </button>
            <button
                onClick={() => onChange("full")}
                className={`px-4 py-2 rounded ${tab === "full" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
                Theo ngày
            </button>
        </div>
    );
}