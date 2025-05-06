
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  has_access: boolean;
  business_name: string | null;
  last_login?: string | null;
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  refreshUsers: () => void;
  resetPassword: (userId: string, userEmail: string) => Promise<boolean>;
}

export const UsersTable = ({ users, loading, refreshUsers, resetPassword }: UsersTableProps) => {
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleToggleAccess = async (userId: string, currentAccess: boolean) => {
    try {
      // Update in user_accounts
      const { error } = await supabase
        .from('user_accounts')
        .update({ has_access: !currentAccess })
        .eq('id', userId);

      if (error) {
        console.error('Error toggling access:', error);
        toast.error('Error al actualizar acceso');
        return;
      }

      toast.success('Acceso actualizado exitosamente');
      refreshUsers();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar acceso');
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    await resetPassword(userId, email);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      // Delete from users_auth
      const { error: authError } = await supabase
        .from('users_auth')
        .delete()
        .eq('id', userToDelete.id);

      if (authError) {
        console.error('Error deleting user from users_auth:', authError);
        toast.error('Error al eliminar usuario');
        return;
      }

      // Also delete from user_accounts
      const { error: accountsError } = await supabase
        .from('user_accounts')
        .delete()
        .eq('id', userToDelete.id);

      if (accountsError) {
        console.error('Error deleting user from user_accounts:', accountsError);
        toast.warning('Usuario eliminado con advertencias');
      }

      toast.success('Usuario eliminado exitosamente');
      setUserToDelete(null);
      refreshUsers();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar usuario');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="w-8 h-8 border-4 border-t-sergen-500 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Fecha de Creación</TableHead>
            <TableHead>Último Login</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.business_name || "-"}</TableCell>
                <TableCell>
                  {user.role === 'superuser' ? 'Superusuario' : 'Usuario'}
                </TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{user.last_login ? new Date(user.last_login).toLocaleDateString() : "Nunca"}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${user.has_access ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.has_access ? 'Activo' : 'Suspendido'}
                  </span>
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleAccess(user.id, user.has_access)}
                    className={user.has_access ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}
                  >
                    {user.has_access ? 'Suspender' : 'Activar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResetPassword(user.id, user.email)}
                  >
                    Resetear Contraseña
                  </Button>
                  {user.role !== 'superuser' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 text-red-600 hover:bg-red-100"
                          onClick={() => setUserToDelete(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará permanentemente la cuenta del usuario 
                            <span className="font-bold"> {user.email}</span>. 
                            Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setUserToDelete(null)}>
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6">
                No hay usuarios registrados en el sistema
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};
