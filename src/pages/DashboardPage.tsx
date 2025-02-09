import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { format, isFuture, isPast, startOfToday } from "date-fns";

interface EnergyData {
  id: string;
  date: string;
  consumption: number;
  demand: number;
  cost: number;
  created_at: string;
  user_id: string;
}

const DashboardPage = () => {
  const [userData, setUserData] = useState<any>(null);
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('energy_data')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching energy data:', error);
        return;
      }

      setEnergyData(data || []);
    };

    fetchUserData();
  }, [navigate]);

  // Función para determinar el estilo del día
  const getDayStyle = (day: Date) => {
    const today = startOfToday();
    
    // Si es un día futuro, retorna gris
    if (isFuture(day)) {
      return { color: "#8E9196" };
    }

    // Para días pasados, simulamos la modulación
    if (isPast(day)) {
      // Simulamos que los días pares fueron modulados (rojo) y los impares no (verde)
      const dayOfMonth = parseInt(format(day, 'd'));
      return { color: dayOfMonth % 2 === 0 ? "#ea384c" : "#34D399" };
    }

    return { color: "" };
  };

  // Sample data for charts
  const lineChartData = [
    { name: 'Aug 19', value: 6500 },
    { name: 'Aug 20', value: 7000 },
    { name: 'Aug 21', value: 6800 },
    { name: 'Aug 22', value: 7200 },
    { name: 'Aug 23', value: 6900 },
    { name: 'Aug 24', value: 7100 },
    { name: 'Aug 25', value: 6700 },
  ];

  const barChartData = [
    { date: '01/08', value: 7200 },
    { date: '02/08', value: 7100 },
    { date: '03/08', value: 7300 },
    { date: '04/08', value: 7000 },
    { date: '05/08', value: 7400 },
    { date: '06/08', value: 7200 },
    { date: '07/08', value: 7500 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Información de cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <button className="w-full bg-sergen-500 text-white p-2 rounded hover:bg-sergen-600">
                    Control de demanda
                  </button>
                  <button className="w-full bg-sergen-500 text-white p-2 rounded hover:bg-sergen-600">
                    Ahorro acumulado
                  </button>
                  <button className="w-full bg-sergen-500 text-white p-2 rounded hover:bg-sergen-600">
                    Desagregado de gasto
                  </button>
                  <button className="w-full bg-sergen-500 text-white p-2 rounded hover:bg-sergen-600">
                    Subir factura de energía
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gestión de riesgo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Potencia Máxima</p>
                    <p className="text-2xl font-bold text-blue-900">7390.37</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rango horario</p>
                    <p className="bg-blue-900 text-white p-2 rounded text-center">Sin modulación</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Riesgo de coincidente</p>
                    <p className="bg-blue-900 text-white p-2 rounded text-center">BAJO</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-6">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Pronóstico diario de potencia máxima</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart width={600} height={300} data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historial diario de potencia máxima</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart width={600} height={300} data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1e3a8a" />
                </BarChart>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Información de servicio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Fecha de contratación</p>
                    <p className="bg-blue-900 text-white p-2 rounded text-center">01/08/2023</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Días sin modulación</p>
                    <p className="bg-blue-900 text-white p-2 rounded text-center">15 días</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Técnico designado</p>
                    <p className="bg-blue-900 text-white p-2 rounded text-center">Ing. Jose Torres</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fin de suscripción</p>
                    <p className="bg-blue-900 text-white p-2 rounded text-center">31/08/2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calendario</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  modifiers={{
                    custom: () => true,
                  }}
                  modifiersStyles={{
                    custom: getDayStyle,
                  }}
                />
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#8E9196]"></div>
                    <span className="text-sm">Días futuros</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ea384c]"></div>
                    <span className="text-sm">Con modulación</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#34D399]"></div>
                    <span className="text-sm">Sin modulación</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
