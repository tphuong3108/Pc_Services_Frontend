"use client";


interface Props {
    selectedMonth: number;
    selectedYear: number;
    onChangeMonth: (month: number) => void;
    onChangeYear: (year: number) => void;
}


export default function MonthYearSelector({ selectedMonth, selectedYear, onChangeMonth, onChangeYear }: Props) {
    const currentYear = new Date().getFullYear();


    return (
        <div className="flex items-center gap-2">
            <select
                value={selectedMonth}
                onChange={(e) => onChangeMonth(Number(e.target.value))}
                className="border rounded px-3 py-1 text-sm"
            >
                {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                ))}
            </select>
            <select
                value={selectedYear}
                onChange={(e) => onChangeYear(Number(e.target.value))}
                className="border rounded px-3 py-1 text-sm"
            >
                {Array.from({ length: 5 }, (_, i) => {
                    const y = currentYear - 2 + i;
                    return <option key={y} value={y}>{y}</option>;
                })}
            </select>
        </div>
    );
}