import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Column<T> {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  render?: (item: T, index: number) => React.ReactNode;
}

interface PremiumTableTemplateProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  rowKey: (item: T) => string | number;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  skeletonRowsCount?: number;
  hideWrapper?: boolean;
}

export function PremiumTableTemplate<T>({
  columns,
  data,
  isLoading = false,
  rowKey,
  emptyStateTitle = "Tidak ada data",
  emptyStateDescription = "Belum ada item yang dapat ditampilkan saat ini.",
  skeletonRowsCount = 3,
  hideWrapper = false,
}: PremiumTableTemplateProps<T>) {
  const tableContent = (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-[12px] text-gray-400 [&>th]:font-medium text-center">
            {columns.map((column) => {
              const alignClass =
                column.align === "left"
                  ? "text-left"
                  : column.align === "right"
                  ? "text-right"
                  : "text-center";
              return (
                <th
                  key={column.key}
                  className={`py-4 px-6 whitespace-nowrap ${alignClass}`}
                >
                  {column.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {isLoading ? (
            // SKELETON LOADER
            Array.from({ length: skeletonRowsCount }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                {columns.map((col) => (
                  <td key={col.key} className="py-4 px-6">
                    <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            // EMPTY STATE
            <tr>
              <td colSpan={columns.length} className="py-16">
                <div className="flex flex-col items-center justify-center text-center px-4">
                  <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                    <AlertCircle className="text-gray-400 h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-black">{emptyStateTitle}</h3>
                  <p className="text-sm font-medium text-gray-500 max-w-sm mt-1">
                    {emptyStateDescription}
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            // REAL DATA ROWS
            <AnimatePresence mode="popLayout">
              {data.map((item, index) => (
                <motion.tr
                  layout
                  key={rowKey(item)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {columns.map((column) => {
                    const alignClass =
                      column.align === "left"
                        ? "text-left"
                        : column.align === "right"
                        ? "text-right"
                        : "text-center";

                    return (
                      <td
                        key={column.key}
                        className={`py-4 px-6 text-xs text-gray-900 ${alignClass}`}
                      >
                        {column.render
                          ? column.render(item, index)
                          : (item as any)[column.key] || "-"}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </AnimatePresence>
          )}
        </tbody>
      </table>
    </div>
  );

  if (hideWrapper) {
    return tableContent;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full">
      {tableContent}
    </div>
  );
}

// EXAMPLE USAGE HELPER (Can be removed or used as reference)
export const ExampleAvatarHelper = ({ name }: { name: string }) => {
  const initials = name
    ? name.trim().split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : "P";
  const simulatedEmail = `${name.toLowerCase().replace(/\s+/g, "")}@gmail.com`;

  const colors = [
    "bg-rose-100 text-rose-700",
    "bg-blue-100 text-blue-700",
    "bg-amber-100 text-amber-700",
    "bg-purple-100 text-purple-700",
    "bg-emerald-100 text-emerald-700",
    "bg-indigo-100 text-indigo-700"
  ];
  const charCode = name ? name.charCodeAt(0) : 65;
  const avatarColorClass = colors[charCode % colors.length];

  return (
    <div className="flex items-center gap-3">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${avatarColorClass}`}>
        {initials}
      </div>
      <div className="flex flex-col text-left">
        <span className="text-sm font-medium text-black leading-tight">{name}</span>
        <span className="text-[11px] text-gray-400 font-medium leading-normal">{simulatedEmail}</span>
      </div>
    </div>
  );
};
