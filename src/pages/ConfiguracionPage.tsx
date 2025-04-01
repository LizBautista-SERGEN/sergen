
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HistoricalTab } from "@/components/admin/forecast/HistoricalTab";
import { ModulationCalendar } from "@/components/admin/ModulationCalendar";

const ConfiguracionPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Configuración</h1>
      <Card className="p-6">
        <Tabs defaultValue="historical" className="space-y-4">
          <TabsList className="grid w-fit grid-cols-2 gap-4">
            <TabsTrigger value="historical">Histórico</TabsTrigger>
            <TabsTrigger value="modulation">Modulación</TabsTrigger>
          </TabsList>
          
          <TabsContent value="historical">
            <HistoricalTab />
          </TabsContent>
          
          <TabsContent value="modulation">
            <ModulationCalendar />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ConfiguracionPage;
