
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DemoData {
  hora: string;
  potencia: number;
  demanda: number;
}

const UserDemo = () => {
  const [demoData, setDemoData] = useState<DemoData[]>([]);
  
  useEffect(() => {
    // Generar datos de demostración
    const generateDemoData = () => {
      const data: DemoData[] = [];
      for (let i = 0; i < 24; i++) {
        data.push({
          hora: `${i.toString().padStart(2, '0')}:00`,
          potencia: Math.floor(Math.random() * 1000) + 500,
          demanda: Math.floor(Math.random() * 800) + 300,
        });
      }
      setDemoData(data);
    };

    generateDemoData();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <div className="container mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
              <p className="text-gray-600">Bienvenido al sistema de gestión energética</p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Consumo Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">789 kW</div>
                  <p className="text-sm text-gray-500">Actualizado hace 5 min</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Demanda Máxima</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">920 kW</div>
                  <p className="text-sm text-gray-500">Límite: 1000 kW</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estado de Modulación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">Activo</div>
                  <p className="text-sm text-gray-500">Funcionando normalmente</p>
                </CardContent>
              </Card>
            </div>

            {/* Chart Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Gráfico de Potencia y Demanda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={demoData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hora" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="potencia" 
                        stroke="#2563eb" 
                        name="Potencia"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="demanda" 
                        stroke="#dc2626" 
                        name="Demanda"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Control Section */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Alertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxDemand">Demanda Máxima (kW)</Label>
                      <Input id="maxDemand" type="number" placeholder="1000" />
                    </div>
                    <Button>Guardar Configuración</Button>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="alertEmail">Email para Alertas</Label>
                      <Input id="alertEmail" type="email" placeholder="usuario@ejemplo.com" />
                    </div>
                    <Button variant="outline">Actualizar Contacto</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default UserDemo;
