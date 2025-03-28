
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ForecastPage } from "@/components/admin/forecast/ForecastPage";

const ConfiguracionPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Configuración</h1>
      <Card className="p-6">
        <Tabs defaultValue="forecast" className="space-y-4">
          <TabsList className="grid w-fit grid-cols-1 md:grid-cols-2 gap-4">
            <TabsTrigger value="forecast">Pronóstico</TabsTrigger>
            <TabsTrigger value="account">Cuenta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="forecast">
            <ForecastPage />
          </TabsContent>
          
          <TabsContent value="account">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Configuración de Cuenta</h2>
              <p>Aquí podrás gestionar la configuración de tu cuenta.</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ConfiguracionPage;
