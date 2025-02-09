import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { format, isFuture, isPast, isSameDay, subDays, addDays } from "date-fns";
import { es } from 'date-fns/locale';

interface EnergyData {
  id: string;
  date: string;
  consumption: number;
  demand: number;
  cost: number;
  created_at: string;
  user_id: string;
  is_modulated: boolean;
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

      console.log("Fetched energy data:", data);
      setEnergyData(data || []);
    };

    fetchUserData();
  }, [navigate]);

  const isDateModulated = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = energyData.find(data => data.date === dateStr);
    return dayData?.is_modulated || false;
  };

  const getDayClassName = (date: Date): string => {
    if (isFuture(date)) return "future-day";
    if (isPast(date)) {
      return isDateModulated(date) ? "modulated-day" : "not-modulated-day";
    }
    return "";
  };

  const modifierStyles = {
    future: { color: "#8E9196" },
    modulated: { color: "#ea384c" },
    notModulated: { color: "#34D399" },
    selected: {
      backgroundColor: "#FEC6A1",
      color: "white",
      "&:hover": {
        backgroundColor: "#FEC6A1"
      }
    }
  };

  const getChartData = () => {
    if (!date) return [];

    // Get 3 days before and 3 days after the selected date
    const startDate = subDays(date, 3);
    const endDate = addDays(date, 3);
    
    const chartData = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const dayData = energyData.find(data => data.date === dateStr);
      
      chartData.push({
        name: format(currentDate, 'dd/MM'),
        value: dayData?.demand || 0,
        consumption: dayData?.consumption || 0
      });

      currentDate = addDays(currentDate, 1);
    }

    return chartData;
  };

  const getBarChartData = () => {
    if (!date) return [];

    // Get 7 days before the selected date for historical data
    const startDate = subDays(date, 6);
    const endDate = date;
    
    const chartData = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const dayData = energyData.find(data => data.date === dateStr);
      
      chartData.push({
        date: format(currentDate, 'dd/MM'),
        value: dayData?.demand || 0
      });

      currentDate = addDays(currentDate, 1);
    }

    return chartData;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-12">
      <div className="container mx-auto px-2 py-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3">
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle>Información de cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
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
              <CardHeader className="pb-2">
                <CardTitle>Gestión de riesgo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
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

          <div className="col-span-6">
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle>Pronóstico diario de potencia máxima</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <LineChart width={650} height={300} data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Historial diario de potencia máxima</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <BarChart width={650} height={300} data={getBarChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1e3a8a" />
                </BarChart>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-3">
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle>Información de servicio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
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
              <CardHeader className="pb-2">
                <CardTitle>Calendario</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  locale={es}
                  modifiers={{
                    future: (date) => isFuture(date),
                    modulated: (date) => isPast(date) && isDateModulated(date),
                    notModulated: (date) => isPast(date) && !isDateModulated(date),
                    selected: (currentDate) => date && currentDate ? isSameDay(currentDate, date) : false
                  }}
                  modifiersStyles={modifierStyles}
                />
                <div className="mt-4 space-y-2">
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
