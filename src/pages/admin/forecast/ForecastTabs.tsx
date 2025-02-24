
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailyTab } from "./DailyTab";
import { HistoricalTab } from "./HistoricalTab";
import { PowerTab } from "./PowerTab";
import { ModulationTab } from "./ModulationTab";

export const ForecastTabs = () => {
  return (
    <Tabs defaultValue="daily" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="daily">Diario</TabsTrigger>
        <TabsTrigger value="historical">Histórico</TabsTrigger>
        <TabsTrigger value="power">Potencia</TabsTrigger>
        <TabsTrigger value="modulation">Modulación</TabsTrigger>
      </TabsList>
      <TabsContent value="daily">
        <DailyTab />
      </TabsContent>
      <TabsContent value="historical">
        <HistoricalTab />
      </TabsContent>
      <TabsContent value="power">
        <PowerTab />
      </TabsContent>
      <TabsContent value="modulation">
        <ModulationTab />
      </TabsContent>
    </Tabs>
  );
};
