'use server';

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function simulatePaymentAction(orderId: string) {
  try {
    // 1. Update status order ke 8 (Selesai)
    const { error: orderError } = await supabaseAdmin
      .from("orders")
      .update({ status: 8 })
      .eq("id", orderId);

    if (orderError) throw orderError;

    // 2. Update status_pembayaran di transactions ke 2 (Lunas)
    const { error: txError } = await supabaseAdmin
      .from("transactions")
      .update({ status_pembayaran: 2 })
      .eq("id_order", orderId);

    if (txError) throw txError;

    return { success: true };
  } catch (error: any) {
    console.error("Error in simulatePaymentAction:", error);
    return { success: false, error: error.message || "Gagal memperbarui status di database." };
  }
}

export async function fetchOrderCreationDates(orderIds: string[]) {
  try {
    if (!orderIds || orderIds.length === 0) return { success: true, data: {} };
    
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("id_order, created_at")
      .in("id_order", orderIds);

    if (error) throw error;

    const datesMap: Record<string, string> = {};
    data.forEach((tx: any) => {
      if (tx.id_order && tx.created_at) {
        datesMap[tx.id_order] = tx.created_at;
      }
    });

    return { success: true, data: datesMap };
  } catch (error: any) {
    console.error("Error in fetchOrderCreationDates:", error);
    return { success: false, error: error.message || "Gagal mengambil data created_at dari transaksi." };
  }
}
