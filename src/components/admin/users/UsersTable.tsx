
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  has_access: boolean;
  business_name: string | null;
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  refreshUsers: () => void;
}

export const UsersTable = ({ users, loading, refreshUsers }: UsersTableProps) => {
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

  const handleResetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success('Correo de restablecimiento enviado');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Error al enviar correo de restablecimiento');
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Fecha de Creación</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.business_name || "-"}</TableCell>
            <TableCell>
              {user.role === 'superuser' ? 'Superusuario' : 'Usuario'}
            </TableCell>
            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
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
                onClick={() => handleResetPassword(user.email)}
              >
                Resetear Contraseña
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
