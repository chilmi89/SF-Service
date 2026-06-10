"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Calendar,
  Clock,
  ClipboardList,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  User,
  ExternalLink,
  XCircle,
  Loader2,
  TrendingUp,
  Receipt
} from "lucide-react";
import { useOrders, OrderItem } from "@/hooks/useOrders";
import { Toast } from "@/components/toast";

export default function OrdersPage() {
  const router = useRouter();
  
  const {
    orders,
    loadingOrders,
    activeTab,
    setActiveTab,
    toast,
    setToast,
    selectedPaymentOrder,
    setSelectedPaymentOrder,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    isPaying,
    handleUploadPaymentProof,
    tenantBankInfo,
    isLoadingBankInfo,
    paymentProofFile,
    setPaymentProofFile,
    setPaymentProofBase64,
    filteredOrders
  } = useOrders();

  // Helper untuk mendapatkan status teks dan styling badge
  const getStatusDetails = (statusId: number) => {
    switch (statusId) {
      case 2:
        return {
          label: "Proses Verifikasi",
          colorClass: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
        };
      case 5:
        return {
          label: "Teknisi Ditugaskan",
          colorClass: "bg-blue-50 text-blue-700 border-blue-100",
          icon: <User className="h-3 w-3 text-blue-500" />
        };
      case 6:
        return {
          label: "Dibatalkan",
          colorClass: "bg-rose-50 text-rose-700 border-rose-100",
          icon: <XCircle className="h-3 w-3 text-rose-500" />
        };
      case 7:
        return {
          label: "Menunggu Pembayaran",
          colorClass: "bg-amber-50 text-amber-700 border-amber-100",
          icon: <AlertCircle className="h-3 w-3 text-amber-500" />
        };
      case 8:
        return {
          label: "Selesai",
          colorClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
          icon: <CheckCircle2 className="h-3 w-3 text-emerald-500" />
        };
      default:
        return {
          label: "Status Lainnya",
          colorClass: "bg-purple-50 text-purple-700 border-purple-100",
          icon: <ClipboardList className="h-3 w-3 text-purple-500" />
        };
    }
  };

  const getPaymentStatusText = (paymentStatus: number) => {
    return paymentStatus === 1 ? "Belum Lunas" : "Lunas";
  };

  if (loadingOrders) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Memuat Pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <main className="relative z-10 px-6 md:px-12 lg:px-20 pt-32 pb-24 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.06] pb-6">
          <div className="space-y-2">
            <button
              onClick={() => router.push("/home")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-black transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Kembali ke Beranda
            </button>
            <h1 className="text-3xl font-black tracking-tight text-black flex items-center gap-3">
              <Receipt className="h-8 w-8" />
              Pesanan Saya
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Pantau status pengerjaan servis dan selesaikan tagihan pembayaran Anda di sini.
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 self-start md:self-auto text-[10px] font-bold text-black uppercase tracking-wider">
            <TrendingUp className="h-3 w-3" />
            Total {orders.length} Pesanan
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-4 border-b border-black/[0.04] pb-2">
          {[
            { id: "semua", label: "Semua Pesanan" },
            { id: "aktif", label: "Sedang Berjalan" },
            { id: "riwayat", label: "Riwayat Selesai" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`text-xs font-bold tracking-wider uppercase pb-2 transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List Pesanan */}
        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order, idx) => {
                const statusDetails = getStatusDetails(order.status);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="group flex flex-col bg-white rounded-2xl border border-black/[0.08] hover:border-black hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Header Kartu */}
                    <div className="p-5 border-b border-black/[0.05] bg-gray-50 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">No. Invoice</span>
                        <span className="text-xs font-bold text-black group-hover:text-black/80">
                          {order.transactions?.invoice_number || `INV-${order.id.slice(0, 8).toUpperCase()}`}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusDetails.colorClass}`}>
                        {statusDetails.icon}
                        {statusDetails.label}
                      </div>
                    </div>

                    {/* Konten Kartu */}
                    <div className="p-5 flex-grow space-y-4">
                      {/* Layanan */}
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Layanan Dipesan</span>
                        <h3 className="text-sm font-black text-black group-hover:translate-x-1 transition-transform duration-200 inline-block">
                          {order.layanan?.nama_layanan || "Layanan Servis"}
                        </h3>
                      </div>

                      {/* Detail Waktu & Lokasi */}
                      <div className="grid grid-cols-2 gap-4 text-xs font-medium text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{order.tanggal_order || "Tanggal belum diatur"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{order.jam ? `${order.jam.slice(0, 5)} WIB` : "Jam belum diatur"}</span>
                        </div>
                      </div>

                      {/* Catatan User */}
                      {order.catatan && (
                        <div className="p-3 bg-gray-50 rounded-xl border border-black/[0.03] space-y-1">
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Catatan Anda</span>
                          <p className="text-[11px] text-gray-500 font-medium italic">"{order.catatan}"</p>
                        </div>
                      )}
                    </div>

                    {/* Footer Kartu */}
                    <div className="px-5 py-4 border-t border-black/[0.05] bg-gray-50/50 flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Total Tagihan</span>
                        <span className="text-sm font-black text-black">
                          Rp {(order.transactions?.total_bayar || order.layanan?.harga_dasar || 0).toLocaleString("id-ID")}
                        </span>
                      </div>

                      {/* Aksi Tambahan */}
                      {order.status === 7 && (
                        <button
                          onClick={() => {
                            setSelectedPaymentOrder(order);
                            setIsPaymentModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white hover:bg-black/90 font-bold text-xs transition-all active:scale-95 shadow-sm"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Bayar Tagihan
                        </button>
                      )}
                      
                      {order.status === 8 && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                          <CheckCircle2 className="h-4 w-4" />
                          Pembayaran Lunas
                        </div>
                      )}

                      {[2, 5].includes(order.status) && (
                        <a
                          href="https://wa.me/6281234567890"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-black/10 hover:border-black text-[10px] font-bold transition-all text-black bg-white"
                        >
                          Hubungi CS <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-black/10 rounded-3xl">
            <ClipboardList className="h-12 w-12 text-gray-300" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-black">Tidak ada pesanan ditemukan</h3>
              <p className="text-xs text-gray-400 font-medium">
                {activeTab === "aktif"
                  ? "Saat ini tidak ada pesanan Anda yang sedang berjalan."
                  : activeTab === "riwayat"
                  ? "Belum ada riwayat pesanan selesai atau dibatalkan."
                  : "Anda belum pernah melakukan pemesanan jasa perbaikan rumah."}
              </p>
            </div>
            <button
              onClick={() => router.push("/home")}
              className="px-5 py-2.5 rounded-xl bg-black text-white font-bold text-xs transition-all active:scale-95 hover:bg-black/90 shadow-sm"
            >
              Cari Jasa Servis Sekarang
            </button>
          </div>
        )}

      </main>

      {/* Upload Bukti Pembayaran Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && selectedPaymentOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-black/15 shadow-2xl rounded-3xl p-6 w-full max-w-md space-y-5"
            >
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
                <h3 className="font-black text-sm text-black uppercase tracking-wider">Penyelesaian Pembayaran</h3>
                <button
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedPaymentOrder(null);
                  }}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-black/[0.03] space-y-3">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-400">Invoice</span>
                    <span className="text-black">{selectedPaymentOrder.transactions?.invoice_number}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-400">Layanan</span>
                    <span className="text-black">{selectedPaymentOrder.layanan?.nama_layanan}</span>
                  </div>
                  <div className="h-px bg-black/[0.05]" />
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-semibold text-gray-400">Total Tagihan</span>
                    <span className="text-base font-black text-black">
                      Rp {(selectedPaymentOrder.transactions?.total_bayar || selectedPaymentOrder.layanan?.harga_dasar || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Bank Accounts Section */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-black uppercase tracking-wider block">Transfer ke Rekening Merchant</span>
                  {isLoadingBankInfo ? (
                    <div className="flex items-center gap-2 py-3 justify-center bg-gray-50 rounded-xl border border-black/[0.03]">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      <span className="text-[11px] font-bold text-gray-400">Memuat info rekening...</span>
                    </div>
                  ) : tenantBankInfo ? (
                    <div className="space-y-1.5">
                      {tenantBankInfo.split(";").filter(Boolean).map((item, idx) => {
                        const [bank, number] = item.split(",");
                        return (
                          <div key={idx} className="flex justify-between items-center bg-black/[0.02] p-2.5 rounded-xl border border-black/[0.03] text-xs font-bold">
                            <span className="text-gray-500">{bank}</span>
                            <span className="text-black select-all">{number}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-[10px] font-bold">
                      Merchant belum menyetel rekening pembayaran. Silakan hubungi CS untuk detail transfer.
                    </div>
                  )}
                </div>

                {/* Upload File Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-black uppercase tracking-wider block">Upload Bukti Transfer</label>
                  <div className="relative border border-dashed border-black/15 hover:border-black/30 transition-colors rounded-2xl p-4 flex flex-col items-center justify-center bg-gray-50/50 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPaymentProofFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPaymentProofBase64(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="text-center space-y-1">
                      <span className="text-xs font-bold text-black block">
                        {paymentProofFile ? paymentProofFile.name : "Pilih File Gambar Bukti Pembayaran"}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium block">
                        Format file: PNG, JPG, JPEG (Max. 5MB)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedPaymentOrder(null);
                  }}
                  className="w-1/2 py-3 rounded-2xl bg-gray-50 hover:bg-gray-100 text-black font-bold text-xs transition-all border border-black/5 active:scale-95"
                >
                  Batal
                </button>
                <button
                  onClick={handleUploadPaymentProof}
                  disabled={isPaying || !paymentProofFile}
                  className="w-1/2 py-3 rounded-2xl bg-black text-white hover:bg-black/90 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md"
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Kirim Bukti
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <Toast
        show={!!toast}
        title={toast?.title}
        message={toast?.message || ""}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
