
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PowerCharts } from "@/components/dashboard/PowerCharts";
import { useState } from "react";

export const PowerTab = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [energyData, setEnergyData] = useState<any[]>([]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Potencia</CardTitle>
      </CardHeader>
      <CardContent>
        <PowerCharts energyData={energyData} date={selectedDate} />
      </CardContent>
    </Card>
  );
};
