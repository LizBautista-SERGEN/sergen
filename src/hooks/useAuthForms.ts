
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
        
        // Omit checking users_auth as it's not necessary to proceed
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
        setLoading(false);
        return;
      }

      // Cerrar cualquier sesión anterior
      await supabase.auth.signOut();

      console.log('Intentando iniciar sesión con:', trimmedEmail);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        console.error('Error de inicio de sesión:', error);
        toast.error("Credenciales inválidas");
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log('Usuario autenticado:', data.user);
        
        // No need to verify users_auth explicitly since it should be created by trigger
        // Just update last_login if possible
        try {
          await supabase
            .from('users_auth')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.user.id);
        } catch (err) {
          // Don't block the login flow if this fails
          console.error('Error updating last login:', err);
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
        } else {
          toast.error("Error al crear la cuenta");
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        toast.success("Cuenta creada exitosamente. Ahora puede iniciar sesión.");
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
