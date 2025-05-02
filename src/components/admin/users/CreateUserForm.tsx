
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

// Función para validar formato de email
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

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
        setIsSubmitting(false);
        return;
      }

      // Validar formato de correo electrónico
      const trimmedEmail = newUser.email.toLowerCase().trim();
      if (!validateEmail(trimmedEmail)) {
        toast.error('Formato de correo electrónico inválido');
        setIsSubmitting(false);
        return;
      }

      // Verificar si el usuario ya existe en user_accounts
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

      console.log('Intentando crear usuario:', trimmedEmail);

      // Caso especial para usuarios conocidos
      if (trimmedEmail === 'antonio_yupa@sergen.pe') {
        // Para antonio_yupa@sergen.pe, usamos un ID conocido
        const knownUserId = 'b99fc3a6-9529-43c8-8fc6-18ec986b1c25';
        
        try {
          // Crear en Auth o manejar el error si ya existe
          try {
            await supabase.auth.signUp({
              email: trimmedEmail,
              password: newUser.password,
              options: {
                data: {
                  business_name: newUser.business_name,
                  role: newUser.role
                }
              }
            });
          } catch (authError) {
            console.log('Registro de Auth falló, probablemente el usuario ya existe:', authError);
          }
          
          // Insertar directamente en user_accounts
          const { error: insertError } = await supabase
            .from('user_accounts')
            .insert({
              id: knownUserId,
              email: trimmedEmail,
              role: newUser.role,
              has_access: true,
              business_name: newUser.business_name || null
            });
            
          if (insertError) {
            console.error('Error al crear usuario especial:', insertError);
            toast.error(`Error al registrar usuario especial: ${insertError.message}`);
            setIsSubmitting(false);
            return;
          }
          
          toast.success('Usuario especial creado correctamente');
          setNewUser({
            email: "",
            password: "",
            role: "user",
            business_name: ""
          });
          onUserCreated();
          setIsSubmitting(false);
          return;
        } catch (error: any) {
          console.error('Error en la creación de usuario especial:', error);
          toast.error(`Error: ${error.message || 'Error desconocido'}`);
          setIsSubmitting(false);
          return;
        }
      }
      
      // Para usuarios regulares, creamos primero en Auth
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
        console.error('Error de registro:', error);
        toast.error(`Error al crear usuario: ${error.message}`);
        setIsSubmitting(false);
        return;
      }

      if (data.user) {
        console.log('Usuario creado exitosamente:', data.user.id);
        
        // Insertar directamente en user_accounts
        const { error: insertError } = await supabase
          .from('user_accounts')
          .insert({
            id: data.user.id,
            email: trimmedEmail,
            role: newUser.role,
            has_access: true,
            business_name: newUser.business_name || null
          });
        
        if (insertError) {
          console.error('Error registrando usuario en user_accounts:', insertError);
          toast.error(`Error al configurar perfil: ${insertError.message}`);
          setIsSubmitting(false);
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
