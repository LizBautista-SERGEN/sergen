
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { HistoricalDataUpload } from "@/components/admin/HistoricalDataUpload";
import { PowerPeaks } from "@/components/admin/PowerPeaks";
import { ModulationCalendar } from "@/components/admin/ModulationCalendar";
import { DailyForecastPanel } from "@/components/admin/forecast/DailyForecastPanel";

const AdminPanel = () => {
  return (
    <div className="container mx-auto py-16 space-y-6">
      <Card className="p-6">
        <Tabs defaultValue="forecast" className="space-y-4">
          <TabsList className="grid w-fit grid-cols-2 gap-4">
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="forecast">Pronóstico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="forecast">
            <Tabs defaultValue="daily" className="space-y-4">
              <TabsList className="grid w-fit grid-cols-4 gap-2">
                <TabsTrigger value="daily">Diario</TabsTrigger>
                <TabsTrigger value="historical">Histórico</TabsTrigger>
                <TabsTrigger value="power">Potencia</TabsTrigger>
                <TabsTrigger value="modulation">Modulación</TabsTrigger>
              </TabsList>

              <TabsContent value="daily">
                <DailyForecastPanel />
              </TabsContent>

              <TabsContent value="historical">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Datos Históricos</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Subir archivo Excel con datos históricos. Se borrarán los datos existentes antes de importar los nuevos.
                  </p>
                  <HistoricalDataUpload />
                </Card>
              </TabsContent>

              <TabsContent value="power">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Potencia Máxima (18:00 - 23:00)</h3>
                  <PowerPeaks />
                </Card>
              </TabsContent>

              <TabsContent value="modulation">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Modulación</h3>
                  <ModulationCalendar />
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminPanel;
