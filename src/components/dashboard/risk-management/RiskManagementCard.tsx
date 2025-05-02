
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MaxPowerDisplay } from "./MaxPowerDisplay";
import { TimeRangeDisplay } from "./TimeRangeDisplay";
import { RiskLevelIndicator } from "./RiskLevelIndicator";
import { ModulatedDaysCounter } from "./ModulatedDaysCounter";

interface RiskManagementCardProps {
  maxPower: number;
  timeRange: string;
  riskLevel: string;
  modulatedDays: number;
}

export const RiskManagementCard = ({
  maxPower,
  timeRange,
  riskLevel,
  modulatedDays
}: RiskManagementCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-center">Gestión de riesgo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-2 flex flex-col items-center">
          <MaxPowerDisplay maxPower={maxPower} />
          <TimeRangeDisplay timeRange={timeRange} />
          <RiskLevelIndicator riskLevel={riskLevel} />
          <ModulatedDaysCounter modulatedDays={modulatedDays} />
        </div>
      </CardContent>
    </Card>
  );
};
