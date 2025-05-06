
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validateEmail } from "../utils/userValidation";

interface NewUser {
  email: string;
  password: string;
  role: string;
  business_name: string;
}

export const useCreateUser = (onUserCreated: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    email: "",
    password: "",
    role: "user",
    business_name: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setNewUser(prev => ({ ...prev, role: value }));
  };

  const handleCreateUser = async () => {
    // Validación básica
    if (!newUser.email || !newUser.password) {
      toast.error("El correo y la contraseña son obligatorios");
      return;
    }

    // Validar formato de email
    if (!validateEmail(newUser.email)) {
      toast.error("El formato del correo electrónico no es válido");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Creando usuario:", newUser.email);
      
      // 1. Verificar primero si el usuario ya existe en user_accounts
      const { data: existingUserAccounts, error: checkUserAccountsError } = await supabase
        .from('user_accounts')
        .select('email')
        .eq('email', newUser.email.trim().toLowerCase());
        
      console.log('Verificación en user_accounts:', {
        existingUserAccounts,
        error: checkUserAccountsError
      });
      
      if (!checkUserAccountsError && existingUserAccounts && existingUserAccounts.length > 0) {
        toast.error("Este correo ya está registrado en user_accounts");
        setIsSubmitting(false);
        return;
      }
      
      // 2. Verificar si el usuario existe en auth.users usando signUp
      console.log("Intentando crear usuario en Auth con:", {
        email: newUser.email.trim(),
        metadata: {
          business_name: newUser.business_name,
          role: newUser.role
        }
      });
      
      // Intentar crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email.trim(),
        password: newUser.password,
        options: {
          data: {
            business_name: newUser.business_name,
            role: newUser.role
          }
        }
      });

      if (authError) {
        console.error("Error detallado de Auth:", {
          message: authError.message,
          code: (authError as any).code,
          status: (authError as any).status,
          details: authError
        });
        
        if (authError.message.includes("already")) {
          toast.error("Este correo ya está registrado en auth.users");
          
          // Intenta obtener más información sobre el usuario existente
          try {
            // Nota: Esto no funcionará directamente con permisos normales,
            // pero añadimos el log para depuración
            console.log("Verificando si el usuario existe en auth usando admin API (esto fallará si no tienes permisos)");
          } catch (e) {
            console.error("No se pudo verificar el usuario existente:", e);
          }
        } else {
          toast.error(`Error al crear usuario: ${authError.message}`);
        }
        setIsSubmitting(false);
        return;
      }

      // 3. Verificar que se creó el usuario
      if (!authData.user) {
        console.error("No se pudo obtener el ID de usuario después del signUp");
        toast.error("Error al crear usuario: No se pudo obtener el ID de usuario");
        setIsSubmitting(false);
        return;
      }

      console.log("Usuario creado con ID:", authData.user.id);

      // 4. Agregar el usuario a user_accounts
      try {
        const { error: accountError } = await supabase
          .from('user_accounts')
          .insert({
            id: authData.user.id,
            email: newUser.email.trim().toLowerCase(),
            role: newUser.role,
            business_name: newUser.business_name,
            has_access: true,
            created_at: new Date().toISOString()
          });

        if (accountError) {
          console.error("Error al agregar usuario a user_accounts:", accountError);
          toast.error(`Error al agregar usuario a la base de datos: ${accountError.message}`);
          setIsSubmitting(false);
          return;
        }
        
        console.log("Usuario agregado a user_accounts exitosamente");
      } catch (accountErr: any) {
        console.error("Error en la inserción a user_accounts:", accountErr);
        toast.error(`Error en la inserción a user_accounts: ${accountErr.message}`);
        setIsSubmitting(false);
        return;
      }

      // 5. Recargar para reflejar los cambios
      toast.success("Usuario creado correctamente");
      setNewUser({
        email: "",
        password: "",
        role: "user",
        business_name: ""
      });
      onUserCreated();
    } catch (error: any) {
      console.error("Error inesperado:", error);
      toast.error(`Error inesperado: ${error.message || "Desconocido"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    newUser,
    isSubmitting,
    handleCreateUser,
    handleInputChange,
    handleRoleChange
  };
};
