
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useAuthForms = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [ruc, setRuc] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const checkSession = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        console.log('Sesión encontrada, redirigiendo');
        navigate('/servicios/control');
      }
    } catch (error) {
      console.error('Error inesperado al verificar sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      
      if (!trimmedEmail || !password) {
        toast.error("Por favor ingrese su correo y contraseña");
        setLoading(false);
        return;
      }

      // Cerrar cualquier sesión anterior para evitar conflictos
      await supabase.auth.signOut();

      console.log('Intentando iniciar sesión con:', trimmedEmail);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        console.error('Error de inicio de sesión:', error);
        
        // Verificar si el usuario existe en user_accounts
        const { data: userAccountData, error: userAccountError } = await supabase
          .from('user_accounts')
          .select('email')
          .eq('email', trimmedEmail)
          .single();
          
        if (!userAccountError && userAccountData) {
          toast.error("Contraseña incorrecta");
        } else {
          // Verificar si existe en auth pero no en user_accounts
          try {
            const { data: authData } = await supabase.auth.admin.listUsers();
            const authUser = authData?.users?.find(user => user.email?.toLowerCase() === trimmedEmail);
            
            if (authUser) {
              // El usuario existe en auth pero no en user_accounts
              // Intentar crear el registro en user_accounts
              const { error: insertError } = await supabase
                .from('user_accounts')
                .insert({
                  id: authUser.id,
                  email: trimmedEmail,
                  role: authUser.user_metadata?.role || 'user',
                  has_access: true,
                  business_name: authUser.user_metadata?.business_name || null
                });
                
              if (insertError) {
                console.error('Error creating user account:', insertError);
                toast.error("Credenciales inválidas");
              } else {
                // Intentar iniciar sesión de nuevo
                const { error: loginError } = await supabase.auth.signInWithPassword({
                  email: trimmedEmail,
                  password,
                });
                
                if (loginError) {
                  toast.error("Credenciales inválidas");
                } else {
                  toast.success("Inicio de sesión exitoso");
                  navigate('/servicios/control');
                }
              }
            } else {
              toast.error("Credenciales inválidas");
            }
          } catch {
            toast.error("Credenciales inválidas");
          }
        }
        
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log('Usuario autenticado:', data.user);
        
        // Actualizar last_login sin bloquear el flujo principal
        setTimeout(() => {
          supabase
            .from('users_auth')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.user!.id)
            .then(({ error }) => {
              if (error && !error.message.includes('JSON object requested') && !error.message.includes('rows returned')) {
                console.error('Error updating last login:', error);
              }
            });
        }, 0);
        
        setEmail("");
        setPassword("");
        
        toast.success("Inicio de sesión exitoso");
        navigate('/servicios/control');
      }
    } catch (error: any) {
      console.error('Error de autenticación:', error);
      toast.error("Error en la autenticación: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      
      if (!trimmedEmail || !password || !confirmPassword || !businessName || !ruc) {
        toast.error("Por favor complete todos los campos");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Las contraseñas no coinciden");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        toast.error("La contraseña debe tener al menos 6 caracteres");
        setLoading(false);
        return;
      }

      // Verificar si el usuario ya existe en user_accounts
      const { data: existingUser, error: checkError } = await supabase
        .from('user_accounts')
        .select('email')
        .eq('email', trimmedEmail)
        .single();
        
      if (!checkError && existingUser) {
        toast.error("Este correo ya está registrado");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            business_name: businessName,
            ruc: ruc,
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        if (error.message.includes('already registered')) {
          toast.error("Este correo ya está registrado");
        } else {
          toast.error("Error al crear la cuenta");
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Asegurarnos de que el usuario también se registre en user_accounts
        const { error: insertError } = await supabase
          .from('user_accounts')
          .insert({
            id: data.user.id,
            email: trimmedEmail,
            business_name: businessName,
            ruc: ruc,
            role: 'user',
            has_access: true
          });
          
        if (insertError && !insertError.message.includes('duplicate key')) {
          console.error('Error creating user account:', insertError);
          toast.error("La cuenta fue creada pero hubo un error al configurar el perfil");
        } else {
          toast.success("Cuenta creada exitosamente. Ahora puede iniciar sesión.");
        }
        
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setBusinessName("");
        setRuc("");
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error("Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    businessName,
    setBusinessName,
    ruc,
    setRuc,
    loading,
    checkSession,
    handleLogin,
    handleSignUp
  };
};
