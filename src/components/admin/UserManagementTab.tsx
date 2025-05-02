
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  has_access: boolean;
}

export const UserManagementTab = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    role: "user",
    business_name: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Check if current user is superuser
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user.id) {
        toast.error('No tiene permisos para ver usuarios');
        return;
      }

      // Get all users from user_accounts
      const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Error al cargar usuarios');
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

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
      fetchUsers();
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

  const handleCreateUser = async () => {
    try {
      if (!newUser.email || !newUser.password) {
        toast.error('El correo y la contraseña son obligatorios');
        return;
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
        user_metadata: {
          business_name: newUser.business_name,
          role: newUser.role
        },
      });

      if (error) {
        console.error('Error creating user:', error);
        toast.error(`Error al crear usuario: ${error.message}`);
        return;
      }

      toast.success('Usuario creado exitosamente');
      
      // Reset form
      setNewUser({
        email: "",
        password: "",
        role: "user",
        business_name: ""
      });
      
      // Refresh user list
      fetchUsers();

    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(`Error al crear usuario: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setNewUser(prev => ({ ...prev, role: value }));
  };

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
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  placeholder="********"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="business_name">Nombre Empresa</Label>
                <Input
                  id="business_name"
                  name="business_name"
                  type="text"
                  value={newUser.business_name}
                  onChange={handleInputChange}
                  placeholder="Nombre de la empresa"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={newUser.role}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="superuser">Superusuario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleCreateUser}>Crear Usuario</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-4 border-t-sergen-500 border-gray-200 rounded-full animate-spin"></div>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};
