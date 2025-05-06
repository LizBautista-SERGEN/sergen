
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

      // Verificar primero si el usuario existe y tiene acceso antes de intentar iniciar sesión
      const { data: userAccountData, error: userAccountError } = await supabase
        .from('user_accounts')
        .select('has_access')
        .eq('email', trimmedEmail)
        .single();
        
      if (!userAccountError && userAccountData && !userAccountData.has_access) {
        toast.error("Su cuenta está suspendida. Contacte al administrador.");
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
        toast.error("Credenciales inválidas. Verifique su correo y contraseña.");
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log('Usuario autenticado:', data.user);
        
        // Verificar si el usuario existe en user_accounts
        const { data: userAccount, error: accountError } = await supabase
          .from('user_accounts')
          .select('id')
          .eq('id', data.user.id);
          
        // Si no existe, lo creamos
        if (!accountError && (!userAccount || userAccount.length === 0)) {
          const { error: insertError } = await supabase
            .from('user_accounts')
            .insert({
              id: data.user.id,
              email: data.user.email || '',
              role: data.user.user_metadata?.role || 'user',
              has_access: true,
              business_name: data.user.user_metadata?.business_name || null
            });
            
          if (insertError) {
            console.error('Error creating user account:', insertError);
          }
        }
        
        // Actualizar last_login directamente en user_accounts
        setTimeout(() => {
          supabase
            .from('user_accounts')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.user.id)
            .then(({ error }) => {
              if (error) {
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
        .eq('email', trimmedEmail);
        
      if (!checkError && existingUser && existingUser.length > 0) {
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
            role: 'user'
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
        // Registramos el usuario directamente en user_accounts
        const { error: insertError } = await supabase
          .from('user_accounts')
          .insert({
            id: data.user.id,
            email: trimmedEmail,
            business_name: businessName,
            ruc: ruc,
            role: 'user',
            has_access: true,
            last_login: new Date().toISOString()
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
