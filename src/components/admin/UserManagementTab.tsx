
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, RefreshCw, KeyRound } from "lucide-react";
import { UsersTable } from "./users/UsersTable";
import { CreateUserForm } from "./users/CreateUserForm";
import { SyncUserForm } from "./users/SyncUserForm";
import { useUserManagement } from "./users/useUserManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePasswordReset } from "./users/hooks/usePasswordReset";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const UserManagementTab = () => {
  const { users, loading, fetchUsers } = useUserManagement();
  const { resetPassword } = usePasswordReset();

  const handleResetAdminPassword = async () => {
    try {
      // Get the user ID for the email
      const { data: userData, error: userError } = await supabase
        .from('user_accounts')
        .select('id')
        .eq('email', 'centro_control@sergen.pe')
        .single();
      
      if (userError || !userData) {
        toast.error("Usuario no encontrado: centro_control@sergen.pe");
        return;
      }
      
      const success = await resetPassword(userData.id, 'centro_control@sergen.pe');
      if (success) {
        toast.success("Contraseña actualizada a 'admin01' para centro_control@sergen.pe");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(`Error al resetear contraseña: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Gestión de Usuarios</CardTitle>
        <div className="flex gap-2">
          <Button 
            onClick={handleResetAdminPassword}
            variant="outline"
            className="flex items-center gap-2"
          >
            <KeyRound size={18} /> Resetear contraseña de administrador
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCw size={18} /> Vincular Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Vincular Usuario Existente</DialogTitle>
              </DialogHeader>
              <SyncUserForm onUserSynced={fetchUsers} />
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus size={18} /> Crear Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="create">
                <TabsList className="w-full">
                  <TabsTrigger value="create" className="flex-1">Crear Nuevo</TabsTrigger>
                  <TabsTrigger value="sync" className="flex-1">Vincular Existente</TabsTrigger>
                </TabsList>
                <TabsContent value="create">
                  <CreateUserForm onUserCreated={fetchUsers} />
                </TabsContent>
                <TabsContent value="sync">
                  <SyncUserForm onUserSynced={fetchUsers} />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <UsersTable 
          users={users} 
          loading={loading} 
          refreshUsers={fetchUsers}
        />
      </CardContent>
    </Card>
  );
};
