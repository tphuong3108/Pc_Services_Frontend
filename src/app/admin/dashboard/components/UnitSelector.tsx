"use client";

interface Props {
  unit: "vnd" | "million";
  onChange: (unit: "vnd" | "million") => void;
}

export default function UnitSelector({ unit, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-600">Đơn vị:</label>
      <select
        value={unit}
        onChange={(e) => onChange(e.target.value as "vnd" | "million")}
        className="border rounded px-3 py-1 text-sm"
      >
        <option value="vnd">Việt Nam Đồng</option>
        <option value="million">Hàng triệu VND</option>
      </select>
    </div>
  );
}
