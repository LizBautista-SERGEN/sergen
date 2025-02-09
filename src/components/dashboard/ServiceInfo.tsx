
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format, isFuture, isPast, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, lastDayOfMonth } from "date-fns";
import { es } from 'date-fns/locale';
import { EnergyData } from "@/types/energy";
import { useEffect, useState } from "react";

interface ServiceInfoProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  energyData: EnergyData[];
}

export const ServiceInfo = ({ date, setDate, energyData }: ServiceInfoProps) => {
  const [contractDate, setContractDate] = useState(startOfMonth(new Date()));
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(lastDayOfMonth(new Date()));

  const isDateModulated = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = energyData.find(data => data.date === dateStr);
    return dayData?.is_modulated || false;
  };

  // Efecto para actualizar la fecha cada día a las 5 PM y al cargar la página
  useEffect(() => {
    const updateData = () => {
      const now = new Date();
      setContractDate(startOfMonth(now));
      setSubscriptionEndDate(lastDayOfMonth(now));
    };

    // Ejecutar inmediatamente al montar el componente
    updateData();

    // Calcular el tiempo hasta las 5 PM
    const calculateTimeUntil5PM = () => {
      const now = new Date();
      const next5PM = new Date(now);
      next5PM.setHours(17, 0, 0, 0);
      
      if (now.getHours() >= 17) {
        next5PM.setDate(next5PM.getDate() + 1);
      }
      
      return next5PM.getTime() - now.getTime();
    };

    // Configurar el primer temporizador para que se ejecute a las 5 PM
    const timer = setTimeout(() => {
      updateData();
      // Después de la primera actualización, configurar un intervalo diario
      const dailyTimer = setInterval(updateData, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyTimer);
    }, calculateTimeUntil5PM());

    return () => clearTimeout(timer);
  }, [energyData]);

  const modifierStyles = {
    future: { color: "#8E9196" },
    modulated: { color: "#C00000" },
    notModulated: { color: "#34D399" },
    selected: {
      backgroundColor: "#FEC6A1",
      color: "white",
      "&:hover": {
        backgroundColor: "#FEC6A1"
      }
    }
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-center">Información de servicio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-2 flex flex-col items-center">
            <div className="text-center w-[200px]">
              <p className="text-sm text-gray-500">Fecha de contratación</p>
              <p style={{ backgroundColor: '#156082', color: 'white' }} className="px-4 py-2 rounded w-full border">
                {format(contractDate, 'dd/MM/yyyy')}
              </p>
            </div>
            <div className="text-center w-[200px]">
              <p className="text-sm text-gray-500">Técnico designado</p>
              <p style={{ backgroundColor: '#156082', color: 'white' }} className="px-4 py-2 rounded w-full border">Ing. Jose Torres</p>
            </div>
            <div className="text-center w-[200px]">
              <p className="text-sm text-gray-500">Fin de suscripción</p>
              <p style={{ backgroundColor: '#156082', color: 'white' }} className="px-4 py-2 rounded w-full border">
                {format(subscriptionEndDate, 'dd/MM/yyyy')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-center">Calendario</CardTitle>
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
              <div className="w-3 h-3 rounded-full bg-[#C00000]"></div>
              <span className="text-sm">Con modulación</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#34D399]"></div>
              <span className="text-sm">Sin modulación</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
