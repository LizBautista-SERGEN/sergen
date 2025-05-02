
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
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error al verificar sesión:', error);
        return;
      }
      
      if (session) {
        console.log('Sesión encontrada:', session);
        const { data: profile, error: profileError } = await supabase
          .from('user_accounts')
          .select('role, has_access')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error al obtener perfil:', profileError);
          return;
        }

        console.log('Perfil obtenido:', profile);
        navigate('/servicios/control');
      }
    } catch (error) {
      console.error('Error inesperado al verificar sesión:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      
      if (!trimmedEmail || !password) {
        toast.error("Por favor ingrese su correo y contraseña");
        return;
      }

      await supabase.auth.signOut();

      console.log('Intentando iniciar sesión con:', trimmedEmail);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        console.error('Error de inicio de sesión:', error);
        if (error.message.includes('Invalid login credentials')) {
          toast.error("Credenciales inválidas");
        } else {
          toast.error("Error al iniciar sesión: " + error.message);
        }
        return;
      }

      if (data.user) {
        console.log('Usuario autenticado:', data.user);
        const { data: profile, error: profileError } = await supabase
          .from('user_accounts')
          .select('role, has_access')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Error al obtener perfil:', profileError);
          toast.error("Error al cargar el perfil");
          return;
        }

        console.log('Perfil obtenido:', profile);

        if (!profile?.has_access) {
          toast.error("Su cuenta está pendiente de activación");
          await supabase.auth.signOut();
          return;
        }

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
        } else if (error.message.includes('Signups not allowed')) {
          toast.error("El registro de usuarios está deshabilitado temporalmente. Por favor, contacte al administrador.");
        } else {
          toast.error("Error al crear la cuenta");
        }
        return;
      }

      if (data.user) {
        toast.success("Cuenta creada exitosamente. Por favor espere la activación de su cuenta.");
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
