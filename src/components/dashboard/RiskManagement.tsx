
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnergyData } from "@/types/energy";
import { format, startOfMonth, isBefore, isAfter } from "date-fns";

interface RiskManagementProps {
  energyData: EnergyData[];
  date: Date | undefined;
}

export const RiskManagement = ({ energyData, date }: RiskManagementProps) => {
  const [maxPower, setMaxPower] = useState<number>(0);
  const [backgroundColor, setBackgroundColor] = useState<string>("#156082");
  const [nonModulatedDays, setNonModulatedDays] = useState(0);

  useEffect(() => {
    const calculateMaxPower = () => {
      if (!date || !energyData.length) return;

      const selectedDateStr = format(date, 'yyyy-MM-dd');
      const dayData = energyData.find(data => data.date === selectedDateStr);
      
      if (!dayData) return;

      setBackgroundColor(dayData.is_modulated ? "#C00000" : "#156082");

      const intervals = [];
      for (let hour = 18; hour <= 23; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          intervals.push(dayData.demand * (0.85 + Math.random() * 0.3));
        }
      }
      
      const maxValue = Math.max(...intervals);
      setMaxPower(Number(maxValue.toFixed(2)));
    };

    calculateMaxPower();
    const interval = setInterval(calculateMaxPower, 60000);

    return () => clearInterval(interval);
  }, [date, energyData]);

  // Nuevo efecto para calcular días sin modulación
  useEffect(() => {
    const updateNonModulatedDays = () => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      
      const nonModulatedCount = energyData.filter(data => {
        const dataDate = new Date(data.date);
        return !data.is_modulated && 
               isAfter(dataDate, monthStart) && 
               isBefore(dataDate, now);
      }).length;

      setNonModulatedDays(nonModulatedCount);
    };

    updateNonModulatedDays();

    const calculateTimeUntil5PM = () => {
      const now = new Date();
      const next5PM = new Date(now);
      next5PM.setHours(17, 0, 0, 0);
      
      if (now.getHours() >= 17) {
        next5PM.setDate(next5PM.getDate() + 1);
      }
      
      return next5PM.getTime() - now.getTime();
    };

    const timer = setTimeout(() => {
      updateNonModulatedDays();
      const dailyTimer = setInterval(updateNonModulatedDays, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyTimer);
    }, calculateTimeUntil5PM());

    return () => clearTimeout(timer);
  }, [energyData]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-center">Gestión de riesgo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-2 flex flex-col items-center">
          <div className="text-center w-[200px]">
            <p className="text-[#8E9196] text-sm">Potencia Máxima</p>
            <p className="text-2xl font-bold text-white bg-[#C00000] border border-gray-200 rounded px-4 h-[42px] flex items-center justify-center">{maxPower}</p>
          </div>
          <div className="text-center w-[200px]">
            <p className="text-[#8E9196] text-sm">Rango horario</p>
            <p style={{ backgroundColor }} className="text-white px-4 h-[42px] rounded w-full flex items-center justify-center">Sin modulación</p>
          </div>
          <div className="text-center w-[200px]">
            <p className="text-[#8E9196] text-sm">Riesgo de coincidente</p>
            <p style={{ backgroundColor }} className="text-white px-4 h-[42px] rounded w-full flex items-center justify-center">BAJO</p>
          </div>
          <div className="text-center w-[200px]">
            <p className="text-sm text-gray-500">Días sin modulación</p>
            <p style={{ backgroundColor: '#156082' }} className="text-white px-4 h-[42px] rounded w-full flex items-center justify-center border">
              {nonModulatedDays} días
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

