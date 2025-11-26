import { ReactNode } from "react";

interface TableHeaderProps {
  title: string;
  breadcrumb: string[];
  actions?: ReactNode;
}

export default function TableHeader({ title, breadcrumb, actions }: TableHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* Left side: Title + Breadcrumb */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <nav className="text-sm text-gray-500">
          {breadcrumb.map((item, idx) => (
            <span key={idx}>
              {item}
              {idx < breadcrumb.length - 1 && " > "}
            </span>
          ))}
        </nav>
      </div>

      {/* Right side: optional actions */}
      {actions && <div className="flex items-center space-x-2">{actions}</div>}
    </div>
  );
}
