
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, lastDayOfMonth, startOfMonth } from "date-fns";
import { EnergyData } from "@/types/energy";
import { useEffect, useState } from "react";
import { Chatbot } from "./Chatbot";

interface ServiceInfoProps {
  energyData: EnergyData[];
}

export const ServiceInfo = ({ energyData }: ServiceInfoProps) => {
  const [contractDate, setContractDate] = useState(startOfMonth(new Date()));
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(lastDayOfMonth(new Date()));

  useEffect(() => {
    const updateData = () => {
      const now = new Date();
      setContractDate(startOfMonth(now));
      setSubscriptionEndDate(lastDayOfMonth(now));
    };

    updateData();

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
      updateData();
      const dailyTimer = setInterval(updateData, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyTimer);
    }, calculateTimeUntil5PM());

    return () => clearTimeout(timer);
  }, [energyData]);

  return (
    <>
      <Card>
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
              <p className="text-sm text-gray-500">Tipo de suscripción</p>
              <p style={{ backgroundColor: '#156082', color: 'white' }} className="px-4 py-2 rounded w-full border">Básico</p>
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
      <Chatbot />
    </>
  );
};
