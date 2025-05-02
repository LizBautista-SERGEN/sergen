
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { validateEmail, isSpecialUser, getSpecialUserId } from "../utils/userValidation";

interface NewUserData {
  email: string;
  password: string;
  role: string;
  business_name: string;
}

export const useCreateUser = (onUserCreated: () => void) => {
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

      // Validate email format
      const trimmedEmail = newUser.email.toLowerCase().trim();
      if (!validateEmail(trimmedEmail)) {
        toast.error('Formato de correo electrónico inválido');
        setIsSubmitting(false);
        return;
      }

      // Check if user already exists
      const { data: existingUsers, error: existingError } = await supabase
        .from('user_accounts')
        .select('id, email, has_access')
        .eq('email', trimmedEmail);
      
      if (!existingError && existingUsers && existingUsers.length > 0) {
        const existingUser = existingUsers[0];
        if (!existingUser.has_access) {
          // Restore access for existing user
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

      // Special case for known users
      if (isSpecialUser(trimmedEmail)) {
        const knownUserId = getSpecialUserId(trimmedEmail);
        
        try {
          // Try to create in Auth or handle if exists
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
          
          // Insert directly into user_accounts
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
          resetForm();
          onUserCreated();
          return;
        } catch (error: any) {
          console.error('Error en la creación de usuario especial:', error);
          toast.error(`Error: ${error.message || 'Error desconocido'}`);
          setIsSubmitting(false);
          return;
        }
      }
      
      // For regular users
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
        
        // Insert directly into user_accounts
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
        resetForm();
        onUserCreated();
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(`Error al crear usuario: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewUser({
      email: "",
      password: "",
      role: "user",
      business_name: ""
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setNewUser(prev => ({ ...prev, role: value }));
  };

  return {
    newUser,
    isSubmitting,
    handleCreateUser,
    handleInputChange,
    handleRoleChange
  };
};
