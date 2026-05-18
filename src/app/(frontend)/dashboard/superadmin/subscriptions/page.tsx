"use client";

import React, { useState } from "react";
import { useManageSubscription } from "@/hooks/superadmin/useManageSubscription";
import { PackageTable } from "@/components/dashboard/superadmin/subscription/PackageTable";
import { PackageModal } from "@/components/dashboard/superadmin/subscription/PackageModal";
import { DeleteConfirmModal } from "@/components/dashboard/superadmin/subscription/DeleteConfirmModal";
import { Toast, ToastType } from "@/components/toast";
import { Sparkles } from "lucide-react";

export default function SuperadminSubscriptionPage() {
  const { plans, isLoading, error, createPlan, updatePlan, deletePlan } =
    useManageSubscription();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<string | number | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: ToastType;
  } | null>(null);

  const handleAdd = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleEdit = (plan: any) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string | number) => {
    setPlanToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;

    setIsProcessing(true);
    const result = await deletePlan(planToDelete);
    setIsProcessing(false);

    if (result.success) {
      setToast({
        show: true,
        title: "Berhasil",
        message: "Paket langganan telah dihapus.",
        type: "success",
      });
      setIsDeleteModalOpen(false);
      setPlanToDelete(null);
    } else {
      setToast({
        show: true,
        title: "Gagal",
        message: result.message || "Terjadi kesalahan saat menghapus paket.",
        type: "error",
      });
      // Optional: keep modal open on error, or close it. Closing it for now.
      setIsDeleteModalOpen(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setIsProcessing(true);
    let result;

    if (selectedPlan) {
      result = await updatePlan(selectedPlan.id, formData);
    } else {
      result = await createPlan(formData);
    }

    setIsProcessing(false);

    if (result.success) {
      setIsModalOpen(false);
      setToast({
        show: true,
        title: "Berhasil",
        message: selectedPlan ? "Paket diperbarui." : "Paket baru dibuat.",
        type: "success",
      });
    } else {
      setToast({
        show: true,
        title: "Gagal",
        message: result.message || "Terjadi kesalahan.",
        type: "error",
      });
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
      {/* HEADER */}
      <section className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-black">
          Manajemen Paket Langganan
        </h1>
        <p className="text-[13px] font-medium text-gray-400 max-w-2xl">
          Atur dan sesuaikan paket langganan yang tersedia untuk seluruh tenant
          di platform FixIt.
        </p>
      </section>

      {/* ERROR STATE */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
          {error}
        </div>
      )}

      {/* CONTENT */}
      <section>
        <PackageTable
          plans={plans}
          isLoading={isLoading}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </section>

      {/* MODAL */}
      <PackageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedPlan}
        isLoading={isProcessing}
      />

      {/* DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isProcessing}
        title="Hapus Paket"
        message="Apakah Anda yakin ingin menghapus paket langganan ini? Tindakan ini akan menghapus paket dari daftar secara permanen."
      />

      {/* TOAST */}
      {toast && (
        <Toast
          show={toast.show}
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
