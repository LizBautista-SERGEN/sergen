
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { DailyPowerManagement } from "@/components/admin/DailyPowerManagement";
import { EnergyManagement } from "@/components/admin/EnergyManagement";

const AdminPanel = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="p-6">
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
            <TabsTrigger value="daily">Potencia Diaria</TabsTrigger>
            <TabsTrigger value="energy">Gestión de Energía</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="daily">
            <DailyPowerManagement />
          </TabsContent>
          
          <TabsContent value="energy">
            <EnergyManagement />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminPanel;
