
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
}

interface User {
  id: string;
  email: string;
}

export const CourseManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

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

  return (
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
  );
};
