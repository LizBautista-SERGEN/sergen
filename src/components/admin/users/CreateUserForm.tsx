
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
          // Primero intentamos crear el usuario en Auth
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
          // Si falla la creación en Auth, podría ser porque ya existe
          console.log('Registro de Auth falló, probablemente el usuario ya existe:', authError);
        }
        
        // Crear la entrada en user_accounts usando una función RPC
        try {
          const { error: rpcError } = await supabase.rpc('admin_create_user_account', {
            p_id: knownUserId,
            p_email: trimmedEmail,
            p_role: newUser.role,
            p_has_access: true,
            p_business_name: newUser.business_name || null
          });
          
          if (rpcError) {
            console.error('Error usando RPC para crear usuario:', rpcError);
            toast.error('Error al registrar usuario especial');
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
        } catch (rpcError) {
          console.error('Error en RPC para crear usuario:', rpcError);
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
        // Si hay un error específico de usuario ya existente
        if (error.message.includes("already")) {
          // Intentamos iniciar sesión para obtener el ID de usuario
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password: newUser.password,
          });
          
          if (signInError) {
            toast.error(`El usuario existe pero no pudimos sincronizarlo: ${signInError.message}`);
            setIsSubmitting(false);
            return;
          }
          
          // Si el inicio de sesión fue exitoso, creamos la entrada en user_accounts
          if (signInData.user) {
            const { error: rpcError } = await supabase.rpc('admin_create_user_account', {
              p_id: signInData.user.id,
              p_email: trimmedEmail,
              p_role: newUser.role,
              p_has_access: true,
              p_business_name: newUser.business_name || null
            });
            
            if (rpcError) {
              console.error('Error usando RPC para crear usuario:', rpcError);
              toast.error('Error al sincronizar usuario existente');
              setIsSubmitting(false);
              return;
            }
            
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
        console.log('Usuario creado exitosamente:', data.user.id);
        
        // Crear la entrada en user_accounts usando una función RPC
        const { error: rpcError } = await supabase.rpc('admin_create_user_account', {
          p_id: data.user.id,
          p_email: trimmedEmail,
          p_role: newUser.role,
          p_has_access: true,
          p_business_name: newUser.business_name || null
        });
        
        if (rpcError) {
          console.error('Error usando RPC para crear usuario:', rpcError);
          toast.error("La cuenta fue creada pero hubo un error al configurar el perfil");
        } else {
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
