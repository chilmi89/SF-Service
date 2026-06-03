"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardCheck, 
  Search, 
  Loader2, 
  Calendar, 
  User, 
  FileText, 
  AlertCircle, 
  Check, 
  X as XIcon,
  Wrench,
  Clock
} from "lucide-react";
import { Toast } from "@/components/toast";
import { useAuth } from "@/hooks/useAuth";
import { useVerifikasiOrder, Order } from "@/hooks/useVerifikasiOrder";

export default function OrderVerificationPage() {
  const { userRole } = useAuth();
  const {
    orders,
    technicians,
    isLoading,
    isSubmitting,
    toast,
    setToast,
    fetchOrders,
    fetchTechnicians,
    acceptOrderWithTask,
    rejectOrder,
  } = useVerifikasiOrder();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"Menunggu Konfirmasi" | "Diterima" | "Ditolak" | "Semua">("Menunggu Konfirmasi");
  
  // State Action Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionType, setActionType] = useState<"Diterima" | "Ditolak" | null>(null);

  // States for Task Creation Form
  const [selectedTechId, setSelectedTechId] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [taskName, setTaskName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    fetchOrders();
    fetchTechnicians();
  }, [fetchOrders, fetchTechnicians]);

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !actionType) return;
    
    let success = false;
    if (actionType === "Diterima") {
      const isOwnerTunggal = userRole?.toLowerCase() === "owner tunggal" || userRole?.toLowerCase() === "owner_tunggal";
      if (!isOwnerTunggal && !selectedTechId) {
        alert("Harap pilih teknisi terlebih dahulu!");
        return;
      }
      success = await acceptOrderWithTask(
        selectedOrder.id,
        isOwnerTunggal ? undefined : selectedTechId,
        deadline,
        taskName,
        description
      );
    } else {
      success = await rejectOrder(selectedOrder.id);
    }

    if (success) {
      setSelectedOrder(null);
      setActionType(null);
    }
  };

  const formatRupiah = (value: any) => {
    const num = Number(value);
    if (isNaN(num)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatOrderDate = (tanggal: string, jam: string) => {
    if (!tanggal) return "-";
    try {
      const datePart = new Date(tanggal).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      return jam ? `${datePart} ${jam}` : datePart;
    } catch {
      return tanggal;
    }
  };

  // Filter & Search Logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.transactions?.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.layanan?.nama_layanan?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "Semua") return matchesSearch;
    return order.status_order === activeTab && matchesSearch;
  });

  // Count helper
  const getCount = (status: "Menunggu Konfirmasi" | "Diterima" | "Ditolak") => {
    return orders.filter(o => o.status_order === status).length;
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-black tracking-tight text-black flex items-center gap-3">
            <ClipboardCheck className="text-black h-8 w-8" />
            Verifikasi Pesanan
          </h1>
          <p className="text-sm font-medium text-gray-500">
            Periksa dan konfirmasi pesanan jasa yang masuk ke tenant Anda.
          </p>
        </motion.div>
      </section>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        {/* TABS */}
        <div className="flex overflow-x-auto w-full md:w-auto gap-1 p-1 bg-gray-50 rounded-xl border border-gray-200/50">
          {(["Menunggu Konfirmasi", "Diterima", "Ditolak", "Semua"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const count = tab !== "Semua" ? getCount(tab) : orders.length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive 
                    ? "bg-white text-black shadow-sm" 
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {tab}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  isActive 
                    ? "bg-black text-white" 
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Cari Pelanggan, Invoice, atau Layanan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all"
          />
        </div>
      </div>

      {/* ORDERS GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-5 bg-gray-200 rounded-full w-1/4"></div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded-xl w-full mt-4"></div>
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm text-center px-4"
        >
          <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
            <AlertCircle className="text-gray-400 h-7 w-7" />
          </div>
          <h3 className="text-lg font-black text-black">Tidak ada pesanan</h3>
          <p className="text-sm font-medium text-gray-500 max-w-sm mt-1">
            {searchTerm 
              ? "Tidak dapat menemukan pesanan yang cocok dengan pencarian Anda." 
              : `Saat ini tidak ada pesanan dengan status "${activeTab}".`}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => {
              const statusColors = {
                "Menunggu Konfirmasi": "bg-amber-50 text-amber-700 border-amber-100",
                "Diterima": "bg-emerald-50 text-emerald-700 border-emerald-100",
                "Ditolak": "bg-red-50 text-red-700 border-red-100"
              };

              return (
                <motion.div
                  layout
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Top Row: Invoice & Status */}
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black tracking-wider text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                        {order.transactions?.invoice_number}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase border ${statusColors[order.status_order]}`}>
                        {order.status_order}
                      </span>
                    </div>

                    {/* Service & Price */}
                    <div>
                      <h3 className="text-lg font-black text-black leading-tight">
                        {order.layanan?.nama_layanan}
                      </h3>
                      <p className="text-emerald-600 font-extrabold text-sm mt-1">
                        {formatRupiah(order.transactions?.total_bayar)}
                      </p>
                    </div>

                    {/* Customer Details */}
                    <div className="pt-3 border-t border-gray-50 space-y-2 text-xs font-semibold text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-900 font-bold">{order.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>{formatOrderDate(order.tanggal_order, order.jam)}</span>
                      </div>
                      {order.catatan && (
                        <div className="mt-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                            <FileText className="h-3 w-3" /> Catatan Pelanggan:
                          </p>
                          <p className="text-[11px] font-medium text-gray-600 italic whitespace-pre-line leading-relaxed">
                            {order.catatan}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions (Only show if status is Menunggu Konfirmasi) */}
                  {order.status_order === "Menunggu Konfirmasi" && (
                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-50">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setActionType("Ditolak");
                        }}
                        className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <XIcon className="h-3.5 w-3.5" />
                        Tolak
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setActionType("Diterima");
                          // Initialize task details
                          setTaskName(`Pekerjaan: ${order.layanan?.nama_layanan || "Servis"}`);
                          setDescription(
                            `Detail pesanan untuk customer ${order.customer_name}. Catatan: ${
                              order.catatan || "-"
                            }`
                          );
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          const formattedDate = tomorrow.toISOString().substring(0, 16);
                          setDeadline(formattedDate);
                          setSelectedTechId("");
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Terima
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* CONFIRMATION ACTION MODAL */}
      <AnimatePresence>
        {selectedOrder && actionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className={`absolute top-0 left-0 w-full h-1.5 ${actionType === "Diterima" ? "bg-emerald-500" : "bg-red-500"}`}></div>
              
              <h3 className="text-xl font-black text-black mb-3">
                {actionType === "Diterima" ? "Terima & Buat Tugas" : "Tolak Pesanan ini?"}
              </h3>
              
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-sm font-medium text-gray-600 mb-6 leading-relaxed">
                <p>
                  Apakah Anda yakin ingin memproses pesanan dari <strong className="text-black">{selectedOrder.customer_name}</strong> dengan layanan <strong className="text-black">"{selectedOrder.layanan?.nama_layanan}"</strong>?
                </p>

                {actionType === "Diterima" && (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-black uppercase tracking-wider text-black">Detail Tugas Baru</h4>
                    
                    {/* Nama Tugas */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Nama Tugas</label>
                      <input 
                        type="text"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-black outline-none focus:border-black transition-all"
                        placeholder="Nama Tugas"
                      />
                    </div>

                    {/* Deskripsi */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Deskripsi Tugas</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-600 outline-none focus:border-black transition-all min-h-[70px] resize-none"
                        placeholder="Deskripsi tugas"
                      />
                    </div>

                    {/* Deadline (Date-Time Picker) */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                        <Clock size={12} /> Deadline Pengerjaan
                      </label>
                      <input 
                        type="datetime-local"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-black outline-none focus:border-black transition-all"
                      />
                    </div>

                    {/* Teknisi (Only if NOT owner tunggal) */}
                    {!(userRole?.toLowerCase() === "owner tunggal" || userRole?.toLowerCase() === "owner_tunggal") ? (
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                          <Wrench size={12} /> Tunjuk Teknisi
                        </label>
                        <select
                          value={selectedTechId}
                          onChange={(e) => setSelectedTechId(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-black outline-none focus:border-black transition-all"
                        >
                          <option value="">-- Pilih Teknisi Tersedia --</option>
                          {technicians.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.full_name} ({t.email || "No Email"})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs font-semibold">
                        Info: Anda terdaftar sebagai <strong>Owner Tunggal</strong>. Tugas ini akan secara otomatis ditugaskan kepada diri Anda sendiri.
                      </div>
                    )}
                  </div>
                )}

                {actionType === "Ditolak" && (
                  <p>
                    Status invoice <strong className="text-black">{selectedOrder.transactions?.invoice_number}</strong> akan diubah menjadi <span className="font-bold px-1.5 py-0.5 rounded text-xs bg-red-50 text-red-700">DITOLAK</span>.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 bg-white shrink-0">
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setActionType(null);
                  }}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-black transition-colors rounded-xl disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={isSubmitting || (actionType === "Diterima" && !(userRole?.toLowerCase() === "owner tunggal" || userRole?.toLowerCase() === "owner_tunggal") && !selectedTechId)}
                  className={`px-5 py-2.5 flex items-center gap-2 font-bold text-xs text-white rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    actionType === "Diterima" 
                      ? "bg-emerald-600 hover:bg-emerald-700" 
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    actionType === "Diterima" ? "Ya, Terima & Tugaskan" : "Ya, Tolak"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
