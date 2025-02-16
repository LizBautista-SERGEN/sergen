
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si ya hay una sesión activa
    checkSession();
  }, [navigate]);

  const checkSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error al verificar sesión:', error);
      return;
    }
    
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role === 'superuser') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        if (error.message.includes('Invalid login credentials')) {
          toast.error("Credenciales inválidas");
        } else {
          toast.error("Error al iniciar sesión");
        }
        return;
      }

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, has_access')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast.error("Error al cargar el perfil");
          return;
        }

        if (!profile?.has_access) {
          toast.error("Su cuenta está pendiente de activación");
          await supabase.auth.signOut();
          return;
        }

        // Limpiar los campos después de un inicio de sesión exitoso
        setEmail("");
        setPassword("");
        
        toast.success("Inicio de sesión exitoso");
        if (profile?.role === 'superuser') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error("Error en la autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Panel de Control</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit"
              className="w-full bg-sergen-500 hover:bg-sergen-600"
              disabled={loading}
            >
              {loading ? "Procesando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
