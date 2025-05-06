
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { UsersTable } from "./users/UsersTable";
import { CreateUserForm } from "./users/CreateUserForm";
import { useUserManagement } from "./users/useUserManagement";

export const UserManagementTab = () => {
  const { users, loading, fetchUsers, resetPassword } = useUserManagement();

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Gestión de Usuarios</CardTitle>
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
            <CreateUserForm onUserCreated={fetchUsers} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <UsersTable 
          users={users} 
          loading={loading} 
          refreshUsers={fetchUsers} 
          resetPassword={resetPassword}
        />
      </CardContent>
    </Card>
  );
};
