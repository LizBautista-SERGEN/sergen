
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, RefreshCw } from "lucide-react";
import { UsersTable } from "./users/UsersTable";
import { CreateUserForm } from "./users/CreateUserForm";
import { SyncUserForm } from "./users/SyncUserForm";
import { useUserManagement } from "./users/useUserManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const UserManagementTab = () => {
  const { users, loading, fetchUsers } = useUserManagement();

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Gestión de Usuarios</CardTitle>
        <div className="flex gap-2">
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
