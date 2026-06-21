import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { apiClient } from "@/lib/api/api-client";
import { layananTenantService } from "@/lib/api/(tenant)/layanan-tenant.service";
import { tenantService } from "@/lib/api/(tenant)/tenant.service";
import { fetchOrderCreationDates } from "../useOrdersActions";

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

// Helper untuk generate SVG Bezier Curve Path dari data nyata pertumbuhan order
const generateSvgPaths = (growth: GrowthDataPoint[]) => {
  if (!growth || growth.length === 0) {
    return { pathD: "", areaD: "", points: [], maxVal: 10 };
  }

  // Pastikan kita memiliki minimal 2 titik untuk menggambar garis
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

  // Membuat smooth Bezier curve (Cubic Bezier)
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

export function useOwnerDashboard() {
  const { userRole } = useAuth();
  const {
    tasks,
    isLoading: isLoadingTasks,
    fetchTasks,
    updateTaskStatus,
    toast,
    setToast,
  } = useTasks();

  const [orders, setOrders] = useState<any[]>([]);
  const [orderCreationDates, setOrderCreationDates] = useState<Record<string, string>>({});
  const [layananCount, setLayananCount] = useState<number>(0);
  const [staffCount, setStaffCount] = useState<number>(0);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(true);

  const fetchDashboardData = useCallback(async () => {
    setIsLoadingDashboard(true);
    try {
      // Resolve tenant ID dari owner yang sedang login secara dinamis
      let myTenantId = null;
      const profileId = localStorage.getItem("profile_id");
      if (profileId) {
        try {
          const profileRes = await apiClient(`/api/profiles/${profileId}`);
          const p = profileRes?.data?.data || profileRes?.data || profileRes;
          if (p && p.kode_tenant) {
            const tenantsRes = await apiClient('/api/tenants');
            const tenants = tenantsRes?.data?.data || tenantsRes?.data || [];
            const myTenant = tenants.find((t: any) => t.kode_tenant === p.kode_tenant);
            if (myTenant) {
              myTenantId = myTenant.id;
              localStorage.setItem("my_tenant_id", myTenant.id);
            }
          }
        } catch (e) {
          console.error("Gagal mendeteksi tenant ID:", e);
        }
      }

      // Fetch parallel sources
      const [resOrders, resLayanan, resStaff] = await Promise.all([
        apiClient("/api/orders?as=tenant"),
        layananTenantService.getLayananTenant(),
        tenantService.getStaff()
      ]);

      // 1. Process Orders
      const rawOrders = resOrders?.data?.data || resOrders?.data || resOrders || [];
      const ordersArray = Array.isArray(rawOrders) ? rawOrders : [];
      const mappedOrders = ordersArray.map((o: any) => {
        const tx = Array.isArray(o.transactions) ? o.transactions[0] : o.transactions;
        return {
          ...o,
          transactions: tx || null
        };
      });
      const filteredOrders = mappedOrders.filter((o: any) => {
        if (!myTenantId) return true;
        const oTenantId = o.layanan?.tenant_id || o.transactions?.tenant_id;
        return oTenantId === myTenantId;
      });
      setOrders(filteredOrders);

      // Fetch transaction created_at dates via Server Action
      const orderIds = filteredOrders.map((o: any) => o.id);
      if (orderIds.length > 0) {
        try {
          const datesRes = await fetchOrderCreationDates(orderIds);
          if (datesRes.success && datesRes.data) {
            setOrderCreationDates(datesRes.data);
          }
        } catch (e) {
          console.error("Gagal mengambil tanggal pembuatan order:", e);
        }
      }

      // 2. Process Layanan
      const rawLayanan = resLayanan?.data?.data || resLayanan?.data || resLayanan || [];
      setLayananCount(Array.isArray(rawLayanan) ? rawLayanan.length : 0);

      // 3. Process Staff
      const rawStaff = resStaff?.data?.data || resStaff?.data || resStaff || [];
      setStaffCount(Array.isArray(rawStaff) ? rawStaff.length : 0);
    } catch (err: any) {
      console.error("Gagal memuat data dashboard owner:", err);
    } finally {
      setIsLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchDashboardData();
  }, [fetchTasks, fetchDashboardData]);

  const isOwnerTunggal = useMemo(() => {
    return userRole?.toLowerCase() === "owner tunggal" || userRole?.toLowerCase() === "owner_tunggal";
  }, [userRole]);

  // Filter order yang diterima (status 5, 7, 8)
  const acceptedOrders = useMemo(() => {
    return orders.filter(o => [5, 7, 8].includes(o.status));
  }, [orders]);

  // Hitung total pendapatan dari order diterima
  const totalRevenue = useMemo(() => {
    return acceptedOrders.reduce((sum, o) => {
      const tx = Array.isArray(o.transactions) ? o.transactions[0] : o.transactions;
      const total = tx?.total_bayar || o.layanan?.harga_dasar || 0;
      return sum + Number(total);
    }, 0);
  }, [acceptedOrders]);

  // Format rupiah
  const formattedRevenue = useMemo(() => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(totalRevenue);
  }, [totalRevenue]);

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
          const dateRaw = orderCreationDates[o.id] || o.created_at || o.tanggal_order;
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
      const dateRaw = orderCreationDates[o.id] || o.created_at || o.tanggal_order;
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
  }, [acceptedOrders, filter, orderCreationDates]);

  const chartPaths = useMemo(() => {
    return generateSvgPaths(growthData);
  }, [growthData]);

  // State untuk hover chart point
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
  
  useEffect(() => {
    if (chartPaths && chartPaths.points.length > 0) {
      setHoveredPoint(chartPaths.points[chartPaths.points.length - 1]);
    } else {
      setHoveredPoint(null);
    }
  }, [chartPaths]);

  return {
    userRole,
    tasks,
    orders,
    isLoadingTasks: isLoadingTasks || isLoadingDashboard,
    updateTaskStatus,
    toast,
    setToast,
    isOwnerTunggal,
    acceptedOrdersCount: acceptedOrders.length,
    formattedRevenue,
    layananCount,
    staffCount,
    chartPaths,
    hoveredPoint,
    setHoveredPoint,
    filter,
    setFilter,
    isFilterDropdownOpen,
    setIsFilterDropdownOpen
  };
}
