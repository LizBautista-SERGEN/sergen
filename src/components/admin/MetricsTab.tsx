
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, UserIcon, CalendarRange } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define data structures
interface UserMetrics {
  id: string;
  email: string;
  lastVisit: string;
  pageViews: number;
  avgTimeMin: number;
}

interface PageMetrics {
  page: string;
  visits: number;
}

export const MetricsTab = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [week, setWeek] = useState("1");
  const [userVisits, setUserVisits] = useState<UserMetrics[]>([]);
  const [generalData, setGeneralData] = useState<PageMetrics[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate available years, months, and weeks
  const years = Array.from({length: 5}, (_, i) => (new Date().getFullYear() - 2 + i).toString());
  const months = Array.from({length: 12}, (_, i) => (i + 1).toString());
  const weeks = Array.from({length: 52}, (_, i) => (i + 1).toString());

  useEffect(() => {
    fetchMetricsData();
  }, [period, year, month, week]);

  const fetchMetricsData = async () => {
    setLoading(true);
    try {
      // In a real app, this would be a fetch from your backend
      // For now, we'll simulate with static data but with different values based on filters
      
      // This would be replaced with real API calls
      // Example: const { data, error } = await supabase.from('user_metrics').select('*');
      
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
      
      // Generate user metrics data with string IDs instead of number IDs
      const userData: UserMetrics[] = [
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
      
      setGeneralData(pageData);
      setUserVisits(userData);
      
    } catch (error) {
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
  
  return (
    <Card className="p-6 space-y-6">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <BarChart2 size={18} />
            Análisis General
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserIcon size={18} />
            Análisis por Usuario
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
          <div className="flex items-center gap-2">
            <CalendarRange size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium">Periodo:</span>
            <Select value={period} onValueChange={(value: "week" | "month" | "year") => setPeriod(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Seleccione periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mes</SelectItem>
                <SelectItem value="year">Año</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            {period === "year" && (
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {(period === "month" || period === "week") && (
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {(period === "month" || period === "week") && (
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(m => (
                    <SelectItem key={m} value={m}>{
                      new Date(2000, parseInt(m) - 1, 1).toLocaleDateString('es', { month: 'long' })
                    }</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {period === "week" && (
              <Select value={week} onValueChange={setWeek}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Semana" />
                </SelectTrigger>
                <SelectContent>
                  {weeks.map(w => (
                    <SelectItem key={w} value={w}>Semana {w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sergen-500"></div>
          </div>
        ) : (
          <>
            <TabsContent value="general" className="space-y-6">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={generalData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="page" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="visits" fill="#8884d8" name="Visitas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Resumen de Métricas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Visitas Totales</div>
                    <div className="text-2xl font-bold mt-1">{totalVisits.toLocaleString()}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Usuarios Activos</div>
                    <div className="text-2xl font-bold mt-1">{activeUsers}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Tiempo Promedio</div>
                    <div className="text-2xl font-bold mt-1">{avgTime.toFixed(1)} min</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Rebote</div>
                    <div className="text-2xl font-bold mt-1">24%</div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Última Visita</TableHead>
                      <TableHead>Vistas de Página</TableHead>
                      <TableHead>Tiempo Promedio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userVisits.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.lastVisit}</TableCell>
                        <TableCell>{user.pageViews}</TableCell>
                        <TableCell>{user.avgTimeMin} min</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </Card>
  );
};
