
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format, isFuture, isPast, isSameDay } from "date-fns";
import { es } from 'date-fns/locale';
import { EnergyData } from "@/types/energy";

interface ServiceInfoProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  energyData: EnergyData[];
}

export const ServiceInfo = ({ date, setDate, energyData }: ServiceInfoProps) => {
  const isDateModulated = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = energyData.find(data => data.date === dateStr);
    return dayData?.is_modulated || false;
  };

  const modifierStyles = {
    future: { color: "#8E9196" },
    modulated: { color: "#ea384c" },
    notModulated: { color: "#34D399" },
    selected: {
      backgroundColor: "#ea384c",
      color: "white",
      "&:hover": {
        backgroundColor: "#ea384c"
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
              <p className="bg-blue-900 text-white px-4 py-2 rounded w-full">01/08/2023</p>
            </div>
            <div className="text-center w-[200px]">
              <p className="text-sm text-gray-500">Días sin modulación</p>
              <p className="bg-blue-900 text-white px-4 py-2 rounded w-full">15 días</p>
            </div>
            <div className="text-center w-[200px]">
              <p className="text-sm text-gray-500">Técnico designado</p>
              <p className="bg-blue-900 text-white px-4 py-2 rounded w-full">Ing. Jose Torres</p>
            </div>
            <div className="text-center w-[200px]">
              <p className="text-sm text-gray-500">Fin de suscripción</p>
              <p className="bg-blue-900 text-white px-4 py-2 rounded w-full">31/08/2024</p>
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
    </>
  );
};

