
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
  const [labelColor, setLabelColor] = useState<string>("#888888");

  useEffect(() => {
    const calculateMaxPower = () => {
      if (!date || !energyData.length) return;

      const selectedDateStr = format(date, 'yyyy-MM-dd');
      const dayData = energyData.find(data => data.date === selectedDateStr);
      
      if (!dayData) return;

      // Generar datos para el día y encontrar el máximo entre 18:00 y 23:00
      const intervals = [];
      for (let hour = 18; hour <= 23; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          intervals.push(dayData.demand * (0.85 + Math.random() * 0.3));
        }
      }
      
      const maxValue = Math.max(...intervals);
      setMaxPower(Number(maxValue.toFixed(2)));
    };

    // Actualizar los valores
    calculateMaxPower();

    // Actualizar el color basado en la hora
    const updateLabelColor = () => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour >= 17) { // 5 PM
        // Obtener el color del calendario
        const calendarColor = "#888888"; // Color por defecto
        setLabelColor(calendarColor);
      }
    };

    updateLabelColor();

    // Configurar actualizaciones automáticas
    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour === 17) { // 5 PM
        calculateMaxPower();
        updateLabelColor();
      }
    };

    // Configurar el intervalo para verificar cada hora
    const interval = setInterval(checkTime, 3600000); // 1 hora en milisegundos

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
            <p className="text-sm" style={{ color: labelColor }}>Potencia Máxima</p>
            <p className="text-2xl font-bold text-white bg-[#C00000] border border-gray-200 rounded px-4 h-[42px] flex items-center justify-center">{maxPower}</p>
          </div>
          <div className="text-center w-[200px]">
            <p className="text-sm" style={{ color: labelColor }}>Rango horario</p>
            <p className="bg-[#156082] text-white px-4 h-[42px] rounded w-full flex items-center justify-center">Sin modulación</p>
          </div>
          <div className="text-center w-[200px]">
            <p className="text-sm" style={{ color: labelColor }}>Riesgo de coincidente</p>
            <p className="bg-[#156082] text-white px-4 h-[42px] rounded w-full flex items-center justify-center">BAJO</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
