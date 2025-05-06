
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

export const useCreateUser = () => {
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

  const createUser = async (onUserCreated?: () => void) => {
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
      // 1. Crear usuario en Auth
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
        if (authError.message.includes("already")) {
          toast.error("Este correo ya está registrado");
        } else {
          toast.error(`Error al crear usuario: ${authError.message}`);
        }
        console.error("Error creating user:", authError);
        setIsSubmitting(false);
        return;
      }

      // 2. Verificar que se creó el usuario
      if (!authData.user) {
        toast.error("Error al crear usuario: No se pudo obtener el ID de usuario");
        setIsSubmitting(false);
        return;
      }

      // 3. Asegurarse de que el usuario también está en user_accounts
      const { error: accountError } = await supabase
        .from('user_accounts')
        .insert({
          id: authData.user.id,
          email: newUser.email.toLowerCase(),
          role: newUser.role,
          business_name: newUser.business_name || null,
          has_access: true
        });

      if (accountError) {
        console.error('Error adding to user_accounts:', accountError);
        toast.warning(`Usuario creado pero con advertencia: ${accountError.message}`);
      } else {
        toast.success("Usuario creado correctamente");
      }

      setNewUser({
        email: "",
        password: "",
        role: "user",
        business_name: ""
      });
      
      if (onUserCreated) {
        onUserCreated();
      }
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
    createUser,
    handleInputChange,
    handleRoleChange
  };
};
