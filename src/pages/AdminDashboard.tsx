
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ArrowUpCircle } from "lucide-react";

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  has_access: boolean;
}

interface Course {
  id: string;
  title: string;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'superuser') {
        navigate('/dashboard');
        return;
      }

      fetchUsers();
      fetchCourses();
    };

    checkAdmin();
  }, [navigate]);

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

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*');

    if (error) {
      toast.error('Error al cargar cursos');
      return;
    }

    setCourses(data || []);
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

  const handleCreateUser = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
      });

      if (error) throw error;

      toast.success('Usuario creado exitosamente');
      setNewUserEmail("");
      setNewUserPassword("");
      fetchUsers();
    } catch (error) {
      toast.error('Error al crear usuario');
      console.error('Error:', error);
    }
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

  const handleGrantCourseAccess = async () => {
    if (!selectedUser || !selectedCourse) {
      toast.error('Selecciona un usuario y un curso');
      return;
    }

    const { error } = await supabase
      .from('course_access')
      .insert({
        user_id: selectedUser,
        course_id: selectedCourse,
        granted_by: (await supabase.auth.getUser()).data.user?.id
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('El usuario ya tiene acceso a este curso');
      } else {
        toast.error('Error al otorgar acceso al curso');
      }
      return;
    }

    toast.success('Acceso al curso otorgado exitosamente');
  };

  const handleUploadEnergyData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { error } = await supabase.functions.invoke('upload-energy-data', {
        body: formData,
      });

      if (error) throw error;

      toast.success('Datos subidos exitosamente');
    } catch (error) {
      toast.error('Error al subir datos');
      console.error('Error:', error);
    }
  };

  const handleToggleModulation = async (date: string, isModulated: boolean) => {
    const { error } = await supabase
      .from('energy_data')
      .update({ is_modulated: !isModulated })
      .eq('date', date);

    if (error) {
      toast.error('Error al actualizar estado de modulación');
      return;
    }

    toast.success('Estado de modulación actualizado');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
            <TabsTrigger value="courses">Gestión de Cursos</TabsTrigger>
            <TabsTrigger value="energy">Gestión de Energía</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="newUserEmail">Email</Label>
                    <Input
                      id="newUserEmail"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="nuevo@usuario.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newUserPassword">Contraseña</Label>
                    <Input
                      id="newUserPassword"
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <Button onClick={handleCreateUser}>Crear Usuario</Button>

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
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Asignación de Cursos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Usuario</Label>
                    <Select onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Curso</Label>
                    <Select onValueChange={setSelectedCourse}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleGrantCourseAccess}>Otorgar Acceso al Curso</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="energy">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Datos de Energía</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleUploadEnergyData}
                    className="hidden"
                    id="energy-data-upload"
                  />
                  <Label
                    htmlFor="energy-data-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <span className="text-gray-600">
                      Click para subir archivo Excel de datos de energía
                    </span>
                  </Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
