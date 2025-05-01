
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HistoricalTab } from "@/components/admin/forecast/HistoricalTab";
import { ModulationTab } from "@/components/admin/ModulationTab";
import { RiskSettingsTab } from "@/components/admin/forecast/RiskSettingsTab";

const ConfiguracionPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Configuración</h1>
      <Card className="p-6">
        <Tabs defaultValue="historical" className="space-y-4">
          <TabsList className="grid w-fit grid-cols-3 gap-4">
            <TabsTrigger value="historical">Histórico</TabsTrigger>
            <TabsTrigger value="modulation">Modulación</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>
          
          <TabsContent value="historical">
            <HistoricalTab />
          </TabsContent>
          
          <TabsContent value="modulation">
            <ModulationTab />
          </TabsContent>
          
          <TabsContent value="settings">
            <RiskSettingsTab />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ConfiguracionPage;
