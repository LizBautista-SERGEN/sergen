
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  has_access: boolean;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // Primero, obtenemos el rol del usuario actual
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user.id) return;

    // Usamos la nueva tabla user_accounts
    const { data: currentUserProfile, error: profileError } = await supabase
      .from('user_accounts')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || currentUserProfile?.role !== 'superuser') {
      toast.error('No tienes permisos para ver usuarios');
      return;
    }

    // Ahora hacemos la consulta para obtener todos los usuarios usando user_accounts
    const { data, error } = await supabase
      .from('user_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
      return;
    }

    console.log('Usuarios obtenidos:', data);
    setUsers(data || []);
  };

  const handleToggleAccess = async (userId: string, currentAccess: boolean) => {
    // Actualizar en user_accounts
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
    fetchUsers();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Usuarios</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleToggleAccess(user.id, user.has_access)}
                  >
                    {user.has_access ? 'Revocar Acceso' : 'Dar Acceso'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleResetPassword(user.email)}
                  >
                    Resetear Contraseña
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
