
import { useState, useEffect } from "react";
import { UserMetrics } from "./MetricsUserTable";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PageMetrics {
  page: string;
  visits: number;
}

export const useMetricsData = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [timeFilter, setTimeFilter] = useState("month"); // For simple time filter dropdown
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [week, setWeek] = useState("1");
  const [userVisits, setUserVisits] = useState<UserMetrics[]>([]);
  const [generalData, setGeneralData] = useState<PageMetrics[]>([]);
  const [users, setUsers] = useState<UserMetrics[]>([]);

  // Generate available years, months, and weeks
  const years = Array.from({length: 5}, (_, i) => (new Date().getFullYear() - 2 + i).toString());
  const months = Array.from({length: 12}, (_, i) => (i + 1).toString());
  const weeks = Array.from({length: 52}, (_, i) => (i + 1).toString());

  useEffect(() => {
    fetchMetricsData();
  }, [period, year, month, week, timeFilter]);

  const fetchMetricsData = async () => {
    setLoading(true);
    try {
      // Attempt to fetch real metrics data from the database
      const { data: realUserMetrics, error: userError } = await supabase
        .from('user_accounts')
        .select('id, email')
        .order('email');

      if (userError) {
        console.error("Error fetching real user metrics:", userError);
        // If there's an error, we'll fall back to simulated data
      }
      
      // Simulated data - in a real app, you would filter on the backend
      let multiplier = 1;
      if (period === "week") multiplier = 0.25;
      if (period === "year") multiplier = 12;
      
      // Offset based on selected time period to make the data look different
      const yearOffset = parseInt(year) - 2023;
      const monthOffset = parseInt(month);
      const weekOffset = parseInt(week);
      
      let offset = 0;
      if (period === "week") {
        offset = weekOffset * 0.1;
      } else if (period === "month") {
        offset = monthOffset * 0.2;
      } else {
        offset = yearOffset * 0.5;
      }
      
      // Generate page metrics data
      const pageData = [
        { page: "Home", visits: Math.round(320 * multiplier * (1 + offset)) },
        { page: "Servicios", visits: Math.round(240 * multiplier * (1 + offset)) },
        { page: "Control", visits: Math.round(480 * multiplier * (1 + offset)) },
        { page: "Configuración", visits: Math.round(120 * multiplier * (1 + offset)) },
        { page: "Perfil", visits: Math.round(60 * multiplier * (1 + offset)) },
      ];
      
      // Generate user metrics data based on real users if available, otherwise use sample data
      let userData: UserMetrics[] = [];
      
      if (realUserMetrics && realUserMetrics.length > 0) {
        // Use real user emails but simulated metrics
        userData = realUserMetrics.map((user, index) => ({
          id: user.id,
          email: user.email,
          lastVisit: `2023-${month.padStart(2, '0')}-${((index + 1) % 28 + 1).toString().padStart(2, '0')}`,
          pageViews: Math.round((40 + index * 5) * (1 + offset)),
          avgTimeMin: parseFloat(((4 + index * 0.5) * (1 + offset * 0.5)).toFixed(1))
        }));
      } else {
        // Fallback to sample user data
        userData = [
          { 
            id: "1", 
            email: "usuario1@sergen.pe", 
            lastVisit: `2023-${month.padStart(2, '0')}-${(parseInt(week) % 28 + 1).toString().padStart(2, '0')}`, 
            pageViews: Math.round(42 * (1 + offset)), 
            avgTimeMin: parseFloat((5.2 * (1 + offset * 0.5)).toFixed(1)) 
          },
          { 
            id: "2", 
            email: "usuario2@sergen.pe", 
            lastVisit: `2023-${month.padStart(2, '0')}-${(parseInt(week) % 28 + 3).toString().padStart(2, '0')}`, 
            pageViews: Math.round(36 * (1 + offset)), 
            avgTimeMin: parseFloat((4.7 * (1 + offset * 0.5)).toFixed(1)) 
          },
          { 
            id: "3", 
            email: "usuario3@sergen.pe", 
            lastVisit: `2023-${month.padStart(2, '0')}-${(parseInt(week) % 28 + 5).toString().padStart(2, '0')}`,
            pageViews: Math.round(21 * (1 + offset)), 
            avgTimeMin: parseFloat((2.5 * (1 + offset * 0.5)).toFixed(1)) 
          },
          { 
            id: "4", 
            email: "victoria_bautista@sergen.pe", 
            lastVisit: `2023-${month.padStart(2, '0')}-${(parseInt(week) % 28 + 2).toString().padStart(2, '0')}`, 
            pageViews: Math.round(58 * (1 + offset)), 
            avgTimeMin: parseFloat((7.1 * (1 + offset * 0.5)).toFixed(1)) 
          },
          { 
            id: "5", 
            email: "carlos.martinez@sergen.pe", 
            lastVisit: `2023-${month.padStart(2, '0')}-${(parseInt(week) % 28 + 7).toString().padStart(2, '0')}`, 
            pageViews: Math.round(15 * (1 + offset)), 
            avgTimeMin: parseFloat((3.2 * (1 + offset * 0.5)).toFixed(1)) 
          },
          { 
            id: "6", 
            email: "admin@sergen.com.pe", 
            lastVisit: `2023-${month.padStart(2, '0')}-${(parseInt(week) % 28 + 4).toString().padStart(2, '0')}`, 
            pageViews: Math.round(72 * (1 + offset)), 
            avgTimeMin: parseFloat((8.3 * (1 + offset * 0.5)).toFixed(1)) 
          },
        ];
      }
      
      setGeneralData(pageData);
      setUserVisits(userData);
      setUsers(userData); // Set the users state
      
    } catch (error: any) {
      console.error("Error fetching metrics:", error);
      toast.error("Error al cargar métricas");
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate summary metrics
  const totalVisits = generalData.reduce((sum, item) => sum + item.visits, 0);
  const activeUsers = userVisits.length;
  const avgTime = userVisits.reduce((sum, user) => sum + user.avgTimeMin, 0) / (activeUsers || 1);

  return {
    isLoading: loading,
    activeTab,
    setActiveTab,
    timeFilter,
    setTimeFilter,
    period,
    setPeriod,
    year,
    setYear,
    month,
    setMonth,
    week,
    setWeek,
    years,
    months,
    weeks,
    users,
    userVisits,
    generalData,
    loading,
    totalVisits,
    activeUsers,
    avgTime
  };
};

export type { PageMetrics };
