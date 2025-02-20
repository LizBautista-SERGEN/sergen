
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart } from 'recharts';
import { PowerChart } from "@/components/admin/forecast/components/PowerChart";
import { ForecastChart } from "@/components/admin/forecast/ForecastChart";
import { HistoricalChart } from "@/components/admin/forecast/HistoricalChart";

interface DemoData {
  hora: string;
  potencia: number;
  demanda: number;
}

interface PowerData {
  fecha: string;
  valor: number;
}

const UserDemo = () => {
  const [demoData, setDemoData] = useState<DemoData[]>([]);
  const [powerData, setPowerData] = useState<PowerData[]>([]);
  const [forecastData, setForecastData] = useState<any[]>([]);
  
  useEffect(() => {
    // Generar datos de demostración para el gráfico de líneas
    const generateDemoData = () => {
      const data: DemoData[] = [];
      for (let i = 0; i < 24; i++) {
        data.push({
          hora: `${i.toString().padStart(2, '0')}:00`,
          potencia: Math.floor(Math.random() * 1000) + 6000,
          demanda: Math.floor(Math.random() * 800) + 6000,
        });
      }
      setDemoData(data);
    };

    // Generar datos de demostración para el gráfico de barras
    const generatePowerData = () => {
      const data: PowerData[] = [];
      const today = new Date();
      for (let i = 0; i < 15; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        data.push({
          fecha: `${date.getDate()}/${date.getMonth() + 1}`,
          valor: Math.floor(Math.random() * 500) + 7000,
        });
      }
      setPowerData(data.reverse());
    };

    generateDemoData();
    generatePowerData();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <DashboardSidebar />
        <div className="flex-1 pt-16"> {/* Añadido pt-16 para dar espacio al header */}
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-12 gap-6">
              {/* Columna izquierda */}
              <div className="col-span-3">
                <Card>
                  <CardHeader className="text-center"> {/* Añadido text-center */}
                    <CardTitle className="text-lg">Información de Cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-2 bg-orange-500 text-white rounded">
                        Control de demanda
                      </div>
                      <div className="p-2 bg-orange-500 text-white rounded">
                        Ahorro acumulado
                      </div>
                      <div className="p-2 bg-orange-500 text-white rounded">
                        Desagregado de gasto
                      </div>
                      <div className="p-2 bg-orange-500 text-white rounded">
                        Subir factura de energía
                      </div>
                      <div className="p-2 bg-orange-500 text-white rounded">
                        Seleccionar fecha
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader className="text-center"> {/* Añadido text-center */}
                    <CardTitle className="text-lg">Gestión de riesgo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Potencia Máxima</p>
                        <p className="text-2xl font-bold text-blue-600">7390.37</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Rango horario</p>
                        <p className="text-xl font-semibold text-gray-700">Sin modulación</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Riesgo de coincidente</p>
                        <p className="text-xl font-semibold text-blue-600">BAJO</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Columna central */}
              <div className="col-span-6">
                <Tabs defaultValue="forecast" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="forecast">Pronóstico</TabsTrigger>
                    <TabsTrigger value="historical">Histórico</TabsTrigger>
                  </TabsList>
                  <TabsContent value="forecast">
                    <Card>
                      <CardHeader>
                        <CardTitle>Pronóstico diario de potencia máxima</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ForecastChart data={demoData} />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="historical">
                    <Card>
                      <CardHeader>
                        <CardTitle>Histórico diario de potencia máxima</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <HistoricalChart data={demoData} />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Gráfico de potencia inferior */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Potencia en tiempo real</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px]">
                      <PowerChart data={powerData} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Columna derecha */}
              <div className="col-span-3">
                <Card>
                  <CardHeader className="text-center"> {/* Añadido text-center */}
                    <CardTitle className="text-lg">Información de servicio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Fecha de contratación</p>
                        <div className="bg-teal-700 text-white p-2 rounded text-center">
                          01/08/2023
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Días sin modulación</p>
                        <div className="bg-teal-700 text-white p-2 rounded text-center">
                          15 días
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Técnico designado</p>
                        <div className="bg-teal-700 text-white p-2 rounded text-center">
                          Ing. Jose Torres
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Fin de suscripción</p>
                        <div className="bg-teal-700 text-white p-2 rounded text-center">
                          31/08/2024
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default UserDemo;
