
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, UserIcon } from "lucide-react";
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

const generalData = [
  { page: "Home", visits: 320 },
  { page: "Servicios", visits: 240 },
  { page: "Control", visits: 480 },
  { page: "Configuración", visits: 120 },
  { page: "Perfil", visits: 60 },
];

const userVisits = [
  { id: 1, email: "usuario1@email.com", lastVisit: "2023-05-01", pageViews: 42, avgTimeMin: 5.2 },
  { id: 2, email: "usuario2@email.com", lastVisit: "2023-05-03", pageViews: 36, avgTimeMin: 4.7 },
  { id: 3, email: "usuario3@email.com", lastVisit: "2023-05-04", pageViews: 21, avgTimeMin: 2.5 },
  { id: 4, email: "usuario4@email.com", lastVisit: "2023-05-02", pageViews: 58, avgTimeMin: 7.1 },
  { id: 5, email: "usuario5@email.com", lastVisit: "2023-05-05", pageViews: 15, avgTimeMin: 3.2 },
];

export const MetricsTab = () => {
  const [timeRange, setTimeRange] = useState("month");

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

        <div className="flex justify-end mb-4">
          <TabsList>
            <TabsTrigger 
              value="week" 
              onClick={() => setTimeRange("week")}
              className={timeRange === "week" ? "bg-primary text-primary-foreground" : ""}
            >
              Semana
            </TabsTrigger>
            <TabsTrigger 
              value="month" 
              onClick={() => setTimeRange("month")}
              className={timeRange === "month" ? "bg-primary text-primary-foreground" : ""}
            >
              Mes
            </TabsTrigger>
            <TabsTrigger 
              value="year" 
              onClick={() => setTimeRange("year")}
              className={timeRange === "year" ? "bg-primary text-primary-foreground" : ""}
            >
              Año
            </TabsTrigger>
          </TabsList>
        </div>

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
                <div className="text-2xl font-bold mt-1">1,220</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Usuarios Activos</div>
                <div className="text-2xl font-bold mt-1">48</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Tiempo Promedio</div>
                <div className="text-2xl font-bold mt-1">4.8 min</div>
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
      </Tabs>
    </Card>
  );
};
