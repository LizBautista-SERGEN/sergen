
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PowerChart } from "./PowerChart";
import { PowerTable } from "./PowerTable";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export const PowerTab = () => {
  const { session } = useAuth();

  const { data = [], isLoading: loading } = useQuery({
    queryKey: ['power-peaks'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('power_peaks')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching power peaks:', error);
        toast.error('Error al cargar los datos de potencia');
        return [];
      }
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0 // Esto fuerza a que siempre se recarguen los datos al montar el componente
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Potencia Máxima (18:00 - 23:00)</h2>
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-4 rounded-lg shadow h-[400px]">
          <PowerChart data={data} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          <PowerTable 
            data={data} 
            onDataChange={() => {
              // Esta función se llamará cuando se actualice un registro en la tabla
              // Ahora usamos React Query, así que solo necesitamos invalidar la consulta
              queryClient.invalidateQueries({ queryKey: ['power-peaks'] });
            }} 
          />
        </div>
      </div>
    </div>
  );
};
