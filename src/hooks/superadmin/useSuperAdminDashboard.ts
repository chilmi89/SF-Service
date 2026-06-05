"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { userService } from "@/lib/api/(superadmin)/user.service";
import { 
  Users, 
  Briefcase, 
  CheckCircle, 
  User 
} from "lucide-react";
import React from "react";

export interface ChartPoint {
  x: number;
  y: number;
  date: string;
  value: number;
}

export interface ChartPaths {
  pathD: string;
  areaD: string;
  points: ChartPoint[];
  maxVal: number;
}

// Helper untuk generate SVG Bezier Curve Path dari data nyata
const generateSvgPaths = (growth: { date: string; count: number; cumulative: number }[]) => {
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

  const maxVal = Math.max(...pointsData.map(p => p.count), 10);
  const minVal = 0;
  
  const width = 1000;
  const height = 300;
  const paddingX = 40;
  const paddingY = 40;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = pointsData.map((p, i) => {
    const x = paddingX + (i / (pointsData.length - 1)) * chartWidth;
    const y = height - paddingY - ((p.count - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, date: p.date, value: p.count };
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

interface DashboardStats {
  totalUsers: number;
  totalOwner: number;
  totalOwnerTunggal: number;
  totalUserBiasa: number;
  growth: { date: string; count: number; cumulative: number }[];
}

export const useSuperAdminDashboard = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
  const [filter, setFilter] = useState<"7days" | "30days" | "all">("7days");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await userService.getAll();
      const rawData = res?.data || res;
      const usersData: any[] = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);

      // 1. Hitung total berdasarkan role_name
      const totalUsers = usersData.length;
      let totalOwner = 0;
      let totalOwnerTunggal = 0;
      let totalUserBiasa = 0;

      usersData.forEach((u) => {
        const role = (u.role_name || "").toLowerCase();
        if (role === "owner") {
          totalOwner++;
        } else if (role === "owner tunggal") {
          totalOwnerTunggal++;
        } else if (role === "user biasa") {
          totalUserBiasa++;
        }
      });

      // 2. Agregasi pertumbuhan jumlah user per hari (non-cumulative)
      const dailyCounts: { [dateStr: string]: number } = {};
      usersData.forEach((user: { created_at: string | null }) => {
        if (user.created_at) {
          const dateStr = new Date(user.created_at).toISOString().split("T")[0];
          dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
        }
      });

      // Melakukan pengisian (fill-in) untuk hari-hari kosong agar kurva kontinunya per hari
      if (usersData.length > 0) {
        const dates = usersData
          .map(u => u.created_at ? new Date(u.created_at) : null)
          .filter((d): d is Date => d !== null)
          .sort((a, b) => a.getTime() - b.getTime());

        if (dates.length > 0) {
          const minDate = new Date(dates[0]);
          minDate.setHours(0, 0, 0, 0);
          
          const maxDate = new Date();
          maxDate.setHours(0, 0, 0, 0);

          const currentDate = new Date(minDate);
          while (currentDate <= maxDate) {
            const dateStr = currentDate.toISOString().split("T")[0];
            if (dailyCounts[dateStr] === undefined) {
              dailyCounts[dateStr] = 0;
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
      }

      const sortedDates = Object.keys(dailyCounts).sort();
      let cumulative = 0;
      const growthData = sortedDates.map(dateStr => {
        cumulative += dailyCounts[dateStr];
        return {
          date: dateStr,
          count: dailyCounts[dateStr],
          cumulative
        };
      });

      setData({
        totalUsers,
        totalOwner,
        totalOwnerTunggal,
        totalUserBiasa,
        growth: growthData
      });
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Menggunakan useMemo agar chartPaths tidak dibuat ulang di setiap render yang memicu loop tak terbatas
  const chartPaths = useMemo(() => {
    if (!data?.growth || data.growth.length === 0) return null;
    
    const filtered = filter === "7days"
      ? data.growth.slice(-7)
      : filter === "30days"
        ? data.growth.slice(-30)
        : data.growth;
        
    return generateSvgPaths(filtered);
  }, [data?.growth, filter]);

  // Set default hovered point ke data point terakhir
  useEffect(() => {
    if (chartPaths && chartPaths.points.length > 0) {
      setHoveredPoint(chartPaths.points[chartPaths.points.length - 1]);
    } else {
      setHoveredPoint(null);
    }
  }, [chartPaths]);

  // 4 Card Utama
  const stats = useMemo(() => {
    return [
      { label: "Total User", value: data?.totalUsers ?? 0, icon: React.createElement(Users, { size: 20 }), color: "text-blue-500" },
      { label: "Total Owner", value: data?.totalOwner ?? 0, icon: React.createElement(Briefcase, { size: 20 }), color: "text-emerald-500" },
      { label: "Total Owner Tunggal", value: data?.totalOwnerTunggal ?? 0, icon: React.createElement(CheckCircle, { size: 20 }), color: "text-amber-500" },
      { label: "Total User Biasa", value: data?.totalUserBiasa ?? 0, icon: React.createElement(User, { size: 20 }), color: "text-indigo-500" },
    ];
  }, [data]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboardData,
    stats,
    filter,
    setFilter,
    isFilterDropdownOpen,
    setIsFilterDropdownOpen,
    chartPaths,
    hoveredPoint,
    setHoveredPoint
  };
};
