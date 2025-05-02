
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DialogFooter, 
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
import { supabase } from "@/integrations/supabase/client";

interface NewUserData {
  email: string;
  password: string;
  role: string;
  business_name: string;
}

export const CreateUserForm = ({ onUserCreated }: { onUserCreated: () => void }) => {
  const [newUser, setNewUser] = useState<NewUserData>({
    email: "",
    password: "",
    role: "user",
    business_name: ""
  });

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
      
      // Callback to refresh user list
      onUserCreated();

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
    <>
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
    </>
  );
};
