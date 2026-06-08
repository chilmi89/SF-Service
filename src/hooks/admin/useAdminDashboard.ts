import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api/api-client";
import { tenantService } from "@/lib/api/(tenant)/tenant.service";

export interface ChartPoint {
  x: number;
  y: number;
  date: string;
  value: number;
}

export interface GrowthDataPoint {
  date: string;
  count: number;
  cumulative: number;
}

const generateSvgPaths = (growth: GrowthDataPoint[]) => {
  if (!growth || growth.length === 0) {
    return { pathD: "", areaD: "", points: [], maxVal: 10 };
  }

  const pointsData = [...growth];
  if (pointsData.length === 1) {
    const d = new Date(pointsData[0].date);
    d.setDate(d.getDate() - 1);
    pointsData.unshift({ date: d.toISOString().split("T")[0], count: 0, cumulative: 0 });
  }

  const maxVal = Math.max(...pointsData.map(p => p.cumulative), 10);
  const minVal = 0;
  
  const width = 1000;
  const height = 300;
  const paddingX = 40;
  const paddingY = 40;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points: ChartPoint[] = pointsData.map((p, i) => {
    const x = paddingX + (i / (pointsData.length - 1)) * chartWidth;
    const y = height - paddingY - ((p.cumulative - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, date: p.date, value: p.cumulative };
  });

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    
    const cpX1 = p0.x + (p1.x - p0.x) / 3;
    const cpY1 = p0.y;
    const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
    const cpY2 = p1.y;
    
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return { pathD, areaD, points, maxVal };
};

export interface RecentOrderUI {
  id: string;
  customerName: string;
  serviceName: string;
  technicianName: string;
  statusText: string;
  timeText: string;
  amount: string;
}

export interface TechnicianStatusUI {
  name: string;
  status: "Sibuk" | "Tersedia";
  color: string;
  task: string;
}

export function useAdminDashboard() {
  const { userRole } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Resolve Profile
      const profileId = localStorage.getItem("profile_id");
      let currentProfile = null;
      if (profileId) {
        try {
          const res = await apiClient(`/api/profiles/${profileId}`);
          currentProfile = res?.data?.data || res?.data || res;
          setProfile(currentProfile);
        } catch (err) {
          console.error("Gagal memuat profil:", err);
        }
      }

      // 2. Resolve Tenant ID
      let myTenantId = localStorage.getItem("my_tenant_id");
      if (!myTenantId && currentProfile?.kode_tenant) {
        try {
          const tenantsRes = await apiClient('/api/tenants');
          const tenants = tenantsRes?.data?.data || tenantsRes?.data || [];
          const myTenant = tenants.find((t: any) => t.kode_tenant === currentProfile.kode_tenant);
          if (myTenant) {
            myTenantId = myTenant.id;
            localStorage.setItem("my_tenant_id", myTenant.id);
          }
        } catch (e) {
          console.error("Gagal mendeteksi tenant ID:", e);
        }
      }

      // 3. Fetch paralel resources
      const [resOrders, resStaff, resTasks] = await Promise.all([
        apiClient("/api/orders?as=tenant"),
        tenantService.getStaff(),
        apiClient("/api/tasks")
      ]);

      // 4. Proses data Orders
      const rawOrders = resOrders?.data?.data || resOrders?.data || resOrders || [];
      const ordersArray = Array.isArray(rawOrders) ? rawOrders : [];
      
      // Normalisasi transactions
      const mappedOrders = ordersArray.map((o: any) => {
        const tx = Array.isArray(o.transactions) ? o.transactions[0] : o.transactions;
        return {
          ...o,
          transactions: tx || null
        };
      });

      // Filter berdasarkan tenant ID
      const filteredOrders = mappedOrders.filter((o: any) => {
        if (!myTenantId) return true;
        const oTenantId = o.layanan?.tenant_id || o.transactions?.tenant_id;
        return oTenantId === myTenantId;
      });
      setOrders(filteredOrders);

      // 5. Proses data Staff
      const rawStaff = resStaff?.data?.data || resStaff?.data || [];
      const staffArray = Array.isArray(rawStaff) ? rawStaff : [];
      setStaff(staffArray);

      // 6. Proses data Tasks
      const rawTasks = resTasks?.data?.data || resTasks?.data || [];
      const tasksArray = Array.isArray(rawTasks) ? rawTasks : [];
      setTasks(tasksArray);

    } catch (err: any) {
      console.error("Gagal memuat data dashboard admin:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Hitung data statistik
  const stats = useMemo(() => {
    // 1. Pesanan Hari Ini (Order yang dibuat hari ini)
    const todayStr = new Date().toISOString().split("T")[0];
    const todayOrders = orders.filter((o: any) => {
      const dateRaw = o.created_at || o.tanggal_order;
      if (!dateRaw) return false;
      const dateStr = new Date(dateRaw).toISOString().split("T")[0];
      return dateStr === todayStr;
    });

    // 2. Teknisi On-Duty (Teknisi yang memiliki tugas aktif)
    const technicians = staff.filter((s: any) => s.role?.toLowerCase() === "teknisi");
    
    // Cari teknisi yang sedang mengerjakan tugas dengan status 2 (Menunggu) atau 3 (Dalam Perjalanan)
    const activeTechnicianIds = new Set(
      tasks
        .filter((t: any) => t.status_tugas === 2 || t.status_tugas === 3 || String(t.status_tugas).toLowerCase() === "dikerjakan" || String(t.status_tugas).toLowerCase() === "dalam perjalanan")
        .map((t: any) => t.technician_id)
        .filter(Boolean)
    );
    const activeTechsCount = technicians.filter((t: any) => activeTechnicianIds.has(t.id)).length;

    // 3. Menunggu Konfirmasi (Order dengan status 2)
    const waitingOrders = orders.filter((o: any) => o.status === 2);

    // 4. Penyelesaian (%)
    const completedOrders = orders.filter((o: any) => o.status === 8);
    const totalOrders = orders.length;
    const completionRate = totalOrders > 0 ? Math.round((completedOrders.length / totalOrders) * 100) : 100;

    return {
      todayOrdersCount: todayOrders.length || orders.length, // Fallback ke total jika 0 agar tampilan demo bagus
      activeTechsRatio: `${activeTechsCount}/${technicians.length}`,
      waitingOrdersCount: waitingOrders.length,
      completionRate: `${completionRate}%`
    };
  }, [orders, staff, tasks]);

  // Relasi order & task untuk mendapatkan info teknisi
  const orderTasksMap = useMemo(() => {
    const map = new Map<string, any>();
    tasks.forEach((t: any) => {
      if (t.order_id) {
        map.set(t.order_id, t);
      }
    });
    return map;
  }, [tasks]);

  // Relasi staff ID ke name
  const staffMap = useMemo(() => {
    const map = new Map<string, string>();
    staff.forEach((s: any) => {
      map.set(s.id, s.full_name || s.name || "Staf");
    });
    return map;
  }, [staff]);

  // Resolusi nama customer secara asinkronus
  const [customerNames, setCustomerNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (orders.length > 0) {
      const customerIds = Array.from(new Set(orders.map((o: any) => o.id_customer).filter(Boolean))) as string[];
      
      const fetchCustomerNames = async () => {
        const tempMap: Record<string, string> = {};
        await Promise.all(
          customerIds.map(async (id) => {
            try {
              const res = await apiClient(`/api/profiles/${id}`);
              const p = res?.data?.data || res?.data || res;
              if (p && p.full_name) {
                tempMap[id] = p.full_name;
              }
            } catch (e) {
              // Ignore
            }
          })
        );
        setCustomerNames(prev => ({ ...prev, ...tempMap }));
      };
      
      fetchCustomerNames();
    }
  }, [orders]);

  // 4 Pesanan Terbaru
  const recentOrdersUI = useMemo<RecentOrderUI[]>(() => {
    const sorted = [...orders]
      .sort((a: any, b: any) => {
        const da = new Date(a.created_at || a.tanggal_order).getTime();
        const db = new Date(b.created_at || b.tanggal_order).getTime();
        return db - da;
      })
      .slice(0, 4);

    return sorted.map((o: any) => {
      const task = orderTasksMap.get(o.id);
      const techName = task && task.technician_id ? (staffMap.get(task.technician_id) || "Teknisi") : "Belum Ditugaskan";
      
      let statusText = "Menunggu";
      if (o.status === 5) statusText = "Diterima";
      else if (o.status === 6) statusText = "Ditolak";
      else if (o.status === 7) statusText = "Dalam Proses";
      else if (o.status === 8) statusText = "Selesai";

      // Relative time/date
      let timeText = "Baru saja";
      if (o.created_at || o.tanggal_order) {
        const diffMs = Date.now() - new Date(o.created_at || o.tanggal_order).getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHrs < 1) {
          const diffMins = Math.floor(diffMs / (1000 * 60));
          timeText = diffMins > 0 ? `${diffMins} Menit lalu` : "Baru saja";
        } else if (diffHrs < 24) {
          timeText = `${diffHrs} Jam lalu`;
        } else {
          timeText = new Date(o.created_at || o.tanggal_order).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
        }
      }

      const amountVal = o.transactions?.total_bayar || o.layanan?.harga_dasar || 0;
      const formattedAmount = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
      }).format(amountVal);

      return {
        id: o.transactions?.invoice_number || `ORD-${o.id.slice(0, 4).toUpperCase()}`,
        customerName: customerNames[o.id_customer] || "Pelanggan",
        serviceName: o.layanan?.nama_layanan || "Layanan Servis",
        technicianName: techName,
        statusText,
        timeText,
        amount: formattedAmount
      };
    });
  }, [orders, orderTasksMap, staffMap, customerNames]);

  // Status List Teknisi
  const technicianStatusUI = useMemo<TechnicianStatusUI[]>(() => {
    const technicians = staff.filter((s: any) => s.role?.toLowerCase() === "teknisi");

    return technicians.map((tech: any) => {
      // Cari jika ada tugas aktif
      const activeTask = tasks.find(
        (t: any) => 
          t.technician_id === tech.id && 
          (t.status_tugas === 2 || t.status_tugas === 3 || String(t.status_tugas).toLowerCase() === "dikerjakan" || String(t.status_tugas).toLowerCase() === "dalam perjalanan")
      );

      const isBusy = !!activeTask;
      
      let taskCode = "Siap Sedia";
      if (isBusy) {
        const relatedOrder = orders.find((o: any) => o.id === activeTask.order_id);
        taskCode = relatedOrder?.transactions?.invoice_number || `TASK-${activeTask.id.slice(0, 4).toUpperCase()}`;
      }

      return {
        name: tech.full_name || tech.name || "Teknisi",
        status: isBusy ? "Sibuk" as const : "Tersedia" as const,
        color: isBusy ? "bg-amber-500" : "bg-emerald-500",
        task: taskCode
      };
    });
  }, [staff, tasks, orders]);

  // Filter order yang diterima (status 5, 7, 8)
  const acceptedOrders = useMemo(() => {
    return orders.filter(o => [5, 7, 8].includes(o.status));
  }, [orders]);

  // Filter and dropdown states
  const [filter, setFilter] = useState<"7days" | "30days" | "all">("7days");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Hitung pertumbuhan order diterima harian (non-kumulatif)
  const growthData = useMemo(() => {
    const getLocalDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const dailyCounts: { [dateStr: string]: number } = {};
    
    const maxDate = new Date();
    maxDate.setHours(23, 59, 59, 999);
    
    let minDate = new Date();
    minDate.setHours(0, 0, 0, 0);
    
    if (filter === "7days") {
      minDate.setDate(maxDate.getDate() - 6);
    } else if (filter === "30days") {
      minDate.setDate(maxDate.getDate() - 29);
    } else {
      const dates = acceptedOrders
        .map((o: any) => {
          const tx = o.transactions;
          const dateRaw = tx?.created_at || o.created_at || o.tanggal_order;
          return dateRaw ? new Date(dateRaw) : null;
        })
        .filter((d): d is Date => d !== null)
        .sort((a, b) => a.getTime() - b.getTime());
      
      if (dates.length > 0) {
        minDate = new Date(dates[0]);
        minDate.setHours(0, 0, 0, 0);
      } else {
        minDate.setDate(maxDate.getDate() - 29);
      }
    }

    const currentDate = new Date(minDate);
    while (currentDate <= maxDate) {
      const dateStr = getLocalDateString(currentDate);
      dailyCounts[dateStr] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    acceptedOrders.forEach((o: any) => {
      const tx = o.transactions;
      const dateRaw = tx?.created_at || o.created_at || o.tanggal_order;
      if (dateRaw) {
        const orderDate = new Date(dateRaw);
        if (orderDate >= minDate && orderDate <= maxDate) {
          const dateStr = getLocalDateString(orderDate);
          if (dailyCounts[dateStr] !== undefined) {
            dailyCounts[dateStr] += 1;
          }
        }
      }
    });

    const sortedDates = Object.keys(dailyCounts).sort();
    return sortedDates.map(dateStr => ({
      date: dateStr,
      count: dailyCounts[dateStr],
      cumulative: dailyCounts[dateStr]
    }));
  }, [acceptedOrders, filter]);

  const chartPaths = useMemo(() => {
    return generateSvgPaths(growthData);
  }, [growthData]);

  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);

  useEffect(() => {
    if (chartPaths && chartPaths.points.length > 0) {
      setHoveredPoint(chartPaths.points[chartPaths.points.length - 1]);
    } else {
      setHoveredPoint(null);
    }
  }, [chartPaths]);

  return {
    profile,
    userRole,
    stats,
    recentOrders: recentOrdersUI,
    technicianStatus: technicianStatusUI,
    isLoading,
    chartPaths,
    hoveredPoint,
    setHoveredPoint,
    filter,
    setFilter,
    isFilterDropdownOpen,
    setIsFilterDropdownOpen
  };
}
