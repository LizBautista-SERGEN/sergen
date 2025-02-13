
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      toast.error('Error al cargar usuarios');
      return;
    }

    setUsers(data || []);
  };

  const handleToggleAccess = async (userId: string, currentAccess: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ has_access: !currentAccess })
      .eq('id', userId);

    if (error) {
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
      toast.error('Error al enviar correo de restablecimiento');
      console.error('Error:', error);
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
