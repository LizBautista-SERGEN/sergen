
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

  // Función para obtener el ID de un usuario ya existente en auth
  const getExistingUserId = async (email: string): Promise<string | null> => {
    try {
      // Intentamos usar la API de admin para buscar el usuario por email
      // Nota: Esto requiere tokens especiales y probablemente fallará
      // pero aquí lo dejamos por si se implementa después
      console.log("Intentando obtener ID del usuario existente por email:", email);
      
      // Como alternativa, podemos intentar iniciar sesión con el usuario
      // pero esto tampoco funciona sin la contraseña correcta
      
      return null; // Por ahora devolvemos null si no podemos obtener el ID
    } catch (error) {
      console.error("Error obteniendo ID del usuario:", error);
      return null;
    }
  };

  // Función para sincronizar un usuario de auth con user_accounts
  const syncUserToAccounts = async (email: string, role: string, business_name: string) => {
    try {
      // 1. Obtener el ID del usuario existente (esto es complicado sin permisos admin)
      const userId = await getExistingUserId(email);
      
      if (!userId) {
        console.log("No se pudo obtener el ID del usuario. Solicitando al administrador que complete manualmente.");
        toast.info("El usuario existe en Auth pero necesita ser vinculado manualmente a user_accounts por un administrador");
        return false;
      }
      
      // 2. Si tenemos el ID, insertar en user_accounts
      const { error: accountError } = await supabase
        .from('user_accounts')
        .insert({
          id: userId,
          email: email.toLowerCase(),
          role: role,
          business_name: business_name,
          has_access: true,
          created_at: new Date().toISOString()
        });

      if (accountError) {
        console.error("Error al sincronizar usuario a user_accounts:", accountError);
        toast.error("Error al sincronizar usuario a user_accounts");
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error("Error en sincronización:", error);
      toast.error("Error en sincronización de cuenta");
      return false;
    }
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

      // Si hay error en la autenticación
      if (authError) {
        console.error("Error detallado de Auth:", {
          message: authError.message,
          code: (authError as any).code,
          status: (authError as any).status,
          details: authError
        });
        
        // Si el usuario ya existe en Auth pero no en user_accounts
        if (authError.message.includes("already") || (authError as any).code === "user_already_exists") {
          console.log("Usuario detectado en auth.users pero no en user_accounts. Intentando sincronizar...");
          toast.info("El usuario ya existe en Auth. Intentando sincronizar con user_accounts...");
          
          // Mostrar mensaje específico para guiar al administrador
          toast.warning("Para completar este proceso: 1) Ve a la consola de Supabase. 2) En Authentication > Users, busca el usuario. 3) Copia su UUID. 4) Crea manualmente un registro en user_accounts con ese UUID");
          
          setIsSubmitting(false);
          return;
        } else {
          toast.error(`Error al crear usuario: ${authError.message}`);
          setIsSubmitting(false);
          return;
        }
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
