
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateUser = async () => {
    try {
      setIsSubmitting(true);
      
      if (!newUser.email || !newUser.password) {
        toast.error('El correo y la contraseña son obligatorios');
        return;
      }

      const trimmedEmail = newUser.email.toLowerCase().trim();

      // Primero verificar si el usuario ya existe en user_accounts
      const { data: existingUsers, error: existingError } = await supabase
        .from('user_accounts')
        .select('id, email, has_access')
        .eq('email', trimmedEmail);
      
      if (!existingError && existingUsers && existingUsers.length > 0) {
        const existingUser = existingUsers[0];
        if (!existingUser.has_access) {
          // Si el usuario existe pero no tiene acceso, le damos acceso
          const { error: updateError } = await supabase
            .from('user_accounts')
            .update({ has_access: true })
            .eq('id', existingUser.id);
            
          if (updateError) {
            toast.error('Error al restaurar acceso al usuario');
          } else {
            toast.success('Se ha restaurado el acceso al usuario');
            onUserCreated();
          }
        } else {
          toast.error('Este correo ya está registrado en el sistema');
        }
        setIsSubmitting(false);
        return;
      }

      // Si no está en user_accounts, intentamos crear el usuario
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: newUser.password,
        options: {
          data: {
            business_name: newUser.business_name,
            role: newUser.role
          }
        }
      });

      if (error) {
        // Si hay un error específico de usuario ya existente
        if (error.message.includes("already")) {
          // Usuario existe en Auth pero no en user_accounts
          // Intentar crear manualmente en user_accounts
          const { error: insertError } = await supabase
            .from('user_accounts')
            .insert({
              email: trimmedEmail,
              role: newUser.role,
              has_access: true,
              business_name: newUser.business_name
            });
            
          if (insertError) {
            console.error('Error registrando usuario en user_accounts:', insertError);
            toast.error('Error al sincronizar el usuario');
          } else {
            toast.success('Usuario sincronizado correctamente');
            setNewUser({
              email: "",
              password: "",
              role: "user",
              business_name: ""
            });
            onUserCreated();
          }
        } else {
          console.error('Error creating user:', error);
          toast.error(`Error al crear usuario: ${error.message}`);
        }
        setIsSubmitting(false);
        return;
      }

      if (data.user) {
        // Asegurarnos de que el usuario también se registre en user_accounts
        const { error: insertError } = await supabase
          .from('user_accounts')
          .insert({
            id: data.user.id,
            email: trimmedEmail,
            role: newUser.role,
            has_access: true,
            business_name: newUser.business_name
          });
          
        if (insertError) {
          console.error('Error creating user account:', insertError);
          toast.error("La cuenta fue creada pero hubo un error al configurar el perfil");
        } else {
          toast.success('Usuario creado exitosamente');
        }

        // Reset form
        setNewUser({
          email: "",
          password: "",
          role: "user",
          business_name: ""
        });
        
        // Callback to refresh user list
        onUserCreated();
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(`Error al crear usuario: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
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
        <Button onClick={handleCreateUser} disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear Usuario'}
        </Button>
      </DialogFooter>
    </>
  );
};
