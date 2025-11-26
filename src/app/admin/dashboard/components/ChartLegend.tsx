"use client";


export default function ChartLegend({ selectedMonth }: { selectedMonth: number }) {
    return (
        <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span>Tháng này</span>
            </div>
            <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span>Tháng {selectedMonth}</span>
            </div>
        </div>
    );
}