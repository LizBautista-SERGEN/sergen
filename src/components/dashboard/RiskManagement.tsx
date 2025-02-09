
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnergyData } from "@/types/energy";
import { format } from "date-fns";

interface RiskManagementProps {
  energyData: EnergyData[];
  date: Date | undefined;
}

export const RiskManagement = ({ energyData, date }: RiskManagementProps) => {
  const [maxPower, setMaxPower] = useState<number>(0);
  const [backgroundColor, setBackgroundColor] = useState<string>("#156082"); // Default to blue (not modulated)
  const [nonModulatedDays, setNonModulatedDays] = useState(0);

  useEffect(() => {
    const calculateMaxPower = () => {
      if (!date || !energyData.length) return;

      const selectedDateStr = format(date, 'yyyy-MM-dd');
      const dayData = energyData.find(data => data.date === selectedDateStr);
      
      if (!dayData) return;

      // Update background color based on modulation state
      setBackgroundColor(dayData.is_modulated ? "#C00000" : "#156082");

      // Generate data for the day and find max between 18:00 and 23:00
      const intervals = [];
      for (let hour = 18; hour <= 23; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          intervals.push(dayData.demand * (0.85 + Math.random() * 0.3));
        }
      }
      
      const maxValue = Math.max(...intervals);
      setMaxPower(Number(maxValue.toFixed(2)));

      // Count non-modulated days
      const nonModulatedCount = energyData.filter(data => !data.is_modulated).length;
      setNonModulatedDays(nonModulatedCount);
    };

    // Calculate initial values
    calculateMaxPower();

    // Set up automatic updates when data changes
    const interval = setInterval(calculateMaxPower, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [date, energyData]);

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

