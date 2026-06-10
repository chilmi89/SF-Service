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
  Clock
} from "lucide-react";
import { Toast } from "@/components/toast";
import { useAuth } from "@/hooks/useAuth";
import { useVerifikasiOrder, Order } from "@/hooks/useVerifikasiOrder";

export default function OwnerOrderVerificationPage() {
  const { userRole } = useAuth();
  const {
    orders,
    isLoading,
    isSubmitting,
    toast,
    setToast,
    fetchOrders,
    acceptOrderWithTask,
    rejectOrder,
  } = useVerifikasiOrder();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"Menunggu Konfirmasi" | "Diterima" | "Ditolak" | "Semua">("Menunggu Konfirmasi");
  
  // State Action Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionType, setActionType] = useState<"Diterima" | "Ditolak" | null>(null);

  // States for Task Creation Form
  const [deadline, setDeadline] = useState<string>("");
  const [taskName, setTaskName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !actionType) return;
    
    let success = false;
    if (actionType === "Diterima") {
      success = await acceptOrderWithTask(
        selectedOrder.id,
        undefined, // Owner Tunggal automatically gets assigned to themselves
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
          <h1 className="text-xl font-black text-black flex items-center gap-3">
            <ClipboardCheck className="text-black h-6 w-6" />
            Verifikasi Pesanan
          </h1>
          <p className="text-sm font-medium text-gray-500">
            Periksa dan konfirmasi pesanan jasa yang masuk ke tenant Anda.
          </p>
        </motion.div>
      </section>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        {/* TABS */}
        <div className="flex overflow-x-auto w-full md:w-auto gap-1 p-1 bg-gray-50 rounded-xl border border-gray-200/50">
          {(["Menunggu Konfirmasi", "Diterima", "Ditolak", "Semua"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const count = tab !== "Semua" ? getCount(tab) : orders.length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs text-gray-400 text-center [&>th]:font-medium">
                  <th className="py-4 px-6">Invoice ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Product/Service</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                // SKELETON LOADER
                [1, 2, 3].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                        <div className="space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                          <div className="h-3 bg-gray-200 rounded w-28"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="py-4 px-6"><div className="h-5 bg-gray-200 rounded-full w-16"></div></td>
                    <td className="py-4 px-6"><div className="h-8 bg-gray-200 rounded-xl w-12 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                // EMPTY STATE
                <tr>
                  <td colSpan={7} className="py-16">
                    <div className="flex flex-col items-center justify-center text-center px-4">
                      <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
                        <AlertCircle className="text-gray-400 h-7 w-7" />
                      </div>
                      <h3 className="text-lg font-bold ">Tidak ada pesanan</h3>
                      <p className="text-sm font-medium text-gray-500 max-w-sm mt-1">
                        {searchTerm 
                          ? "Tidak dapat menemukan pesanan yang cocok dengan pencarian Anda." 
                          : `Saat ini tidak ada pesanan dengan status "${activeTab}".`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                // REAL DATA ROWS
                <AnimatePresence mode="popLayout">
                  {filteredOrders.map((order) => {
                    const statusColors = {
                      "Menunggu Konfirmasi": "bg-amber-50 text-amber-700 border-amber-100",
                      "Diterima": "bg-emerald-50 text-emerald-700 border-emerald-100",
                      "Ditolak": "bg-red-50 text-red-700 border-red-100"
                    };
                    
                    // Generate initials
                    const initials = order.customer_name
                      ? order.customer_name.trim().split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
                      : "P";
                      
                    // Simulated email for aesthetic completeness (matching Gmail style from user reference screenshot)
                    const simulatedEmail = order.customer_name
                      ? `${order.customer_name.toLowerCase().replace(/\s+/g, "")}@gmail.com`
                      : "customer@gmail.com";

                    // Background color options for avatar based on name letters (like Google Contacts)
                    const colors = [
                      "bg-rose-100 text-rose-700",
                      "bg-blue-100 text-blue-700",
                      "bg-amber-100 text-amber-700",
                      "bg-purple-100 text-purple-700",
                      "bg-emerald-100 text-emerald-700",
                      "bg-indigo-100 text-indigo-700"
                    ];
                    const charCode = order.customer_name ? order.customer_name.charCodeAt(0) : 65;
                    const avatarColorClass = colors[charCode % colors.length];

                    return (
                      <motion.tr
                        layout
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        {/* Invoice ID */}
                        <td className="py-4 px-6 font-medium text-xs text-gray-950">
                          {order.transactions?.invoice_number || "N/A"}
                        </td>

                        {/* Customer */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${avatarColorClass}`}>
                              {initials}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-black leading-tight">
                                {order.customer_name}
                              </span>
                              <span className="text-[10px] text-gray-400 font-semibold leading-normal">
                                {simulatedEmail}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Product/Service */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-900">
                              {order.layanan?.nama_layanan || "Jasa Perbaikan"}
                            </span>
                            {order.catatan && (
                              <span className="text-[10px] font-medium text-gray-400 italic mt-0.5 truncate max-w-[200px]" title={order.catatan}>
                                "{order.catatan}"
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-6 text-xs font-small text-emerald-600">
                          {formatRupiah(order.transactions?.total_bayar)}
                        </td>

                        {/* Date */}
                        <td className="py-4 px-6 text-xs font-semibold text-gray-500">
                          {formatOrderDate(order.tanggal_order, order.jam)}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[order.status_order]}`}>
                            {order.status_order}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-4 px-6">
                          <div className="flex gap-2 justify-center items-center">
                            {order.status_order === "Menunggu Konfirmasi" ? (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setActionType("Diterima");
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
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 text-[11px] font-bold uppercase transition-all shadow-sm flex items-center gap-1 active:scale-95"
                                >
                                  <Check className="h-3 w-3" />
                                  Terima
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setActionType("Ditolak");
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-600 text-[10px] font-black uppercase transition-all flex items-center gap-1 active:scale-95"
                                >
                                  <XIcon className="h-3 w-3" />
                                  Tolak
                                </button>
                              </>
                            ) : (order.status_order === "Diterima" && !order.hasTask) ? (
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setActionType("Diterima");
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
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 text-[10px] font-black uppercase transition-all shadow-sm flex items-center gap-1 active:scale-95"
                              >
                                <Check className="h-3 w-3" />
                                Tugas
                              </button>
                            ) : (
                              <span className="text-[10px] font-medium text-gray-400 uppercase">
                                Selesai Konfirmasi
                              </span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

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

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs font-semibold">
                      Info: Anda terdaftar sebagai <strong>Owner Tunggal</strong>. Tugas ini akan secara otomatis ditugaskan kepada diri Anda sendiri.
                    </div>
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
                  disabled={isSubmitting}
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
