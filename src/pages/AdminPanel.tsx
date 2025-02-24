
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersTab } from "./admin/UsersTab";
import { ForecastTabs } from "./admin/forecast/ForecastTabs";

const AdminPanel = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
      
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="forecast">Pronóstico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        
        <TabsContent value="forecast">
          <ForecastTabs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
