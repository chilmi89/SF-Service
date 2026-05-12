"use client";

import React from "react";
import { Edit2, Trash2, Plus, Loader2 } from "lucide-react";

interface PackageTableProps {
  plans: any[];
  isLoading: boolean;
  onEdit: (plan: any) => void;
  onDelete: (id: string | number) => void;
  onAdd: () => void;
}

export const PackageTable: React.FC<PackageTableProps> = ({
  plans,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-black">Daftar Paket</h2>
          <p className="text-xs font-medium text-gray-400">Total {plans.length} paket tersedia</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-black text-white px-4 h-11 rounded-xl text-xs font-medium shadow-sm shadow-black/10 hover:bg-zinc-800 transition-all"
        >
          <Plus size={16} />
          Tambah Paket
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[14px] font-medium text-gray-600">Nama Paket</th>
                <th className="px-6 py-4 text-[14px] font-medium text-gray-600">Harga</th>
                <th className="px-6 py-4 text-[14px] font-medium text-gray-600">Durasi</th>
                <th className="px-6 py-4 text-[14px] font-medium text-gray-600">Deskripsi</th>
                <th className="px-6 py-4 text-[14px] font-medium text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-200" />
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-sm font-bold text-gray-400">Belum ada paket langganan.</p>
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-black">{plan.nama_paket || "Paket Standard"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium ">{formatCurrency(plan.harga)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-500">{plan.durasi} Hari</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-xs font-medium text-gray-400 line-clamp-1">{plan.deskripsi || "-"}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(plan)}
                          className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(plan.id)}
                          className="h-9 w-9 rounded-lg border border-gray-100 flex items-center justify-center text-red-300 hover:text-red-500 hover:border-red-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
