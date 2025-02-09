
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EnergyData {
  id: string;           // Cambiado de number a string para coincidir con UUID de Supabase
  date: string;
  consumption: number;
  demand: number;
  cost: number;
  created_at: string;   // Añadido para coincidir con la estructura de Supabase
  user_id: string;      // Añadido para coincidir con la estructura de Supabase
}

const DashboardPage = () => {
  const [userData, setUserData] = useState<any>(null);
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Fetch user's energy data
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

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Panel de Control</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Consumo (kWh)</TableHead>
                    <TableHead>Demanda (kW)</TableHead>
                    <TableHead>Costo (S/.)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {energyData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.consumption}</TableCell>
                      <TableCell>{row.demand}</TableCell>
                      <TableCell>{row.cost}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
