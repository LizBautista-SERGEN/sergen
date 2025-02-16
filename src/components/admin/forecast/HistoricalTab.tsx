
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export const HistoricalTab = () => {
  const { data: historicalData, isLoading, refetch } = useQuery({
    queryKey: ['historical-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coes_historical')
        .select('*')
        .order('fecha', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const updateHistoricalData = async () => {
    try {
      await supabase.functions.invoke('get-coes-historical');
      refetch();
    } catch (error) {
      console.error('Error al actualizar datos históricos:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Datos Históricos</h2>
        <Button onClick={updateHistoricalData}>
          Actualizar Datos
        </Button>
      </div>

      <div className="border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reprogramación Diaria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ejecutado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {historicalData?.map((row) => (
              <tr key={row.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(row.fecha), 'dd/MM/yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {row.reprogramacion_diaria?.toLocaleString() || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {row.ejecutado?.toLocaleString() || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
