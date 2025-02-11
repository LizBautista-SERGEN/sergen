
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      
      if (password.length < 6) {
        toast.error("La contraseña debe tener al menos 6 caracteres");
        setLoading(false);
        return;
      }

      if (isLogin) {
        // Handle login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          console.error('Login error:', error);
          if (error.message.includes('Invalid login credentials')) {
            toast.error("Credenciales inválidas. Por favor verifique su correo y contraseña");
          } else if (error.message.includes('Email not confirmed')) {
            toast.error("Por favor confirme su correo electrónico antes de iniciar sesión");
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (profile?.role === 'superuser') {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
          toast.success("Inicio de sesión exitoso");
        }
      } else {
        // Check if user already exists before signup
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', trimmedEmail)
          .single();

        if (existingProfile) {
          toast.error("Este correo ya está registrado. Por favor, inicie sesión.");
          setIsLogin(true);
          setLoading(false);
          return;
        }

        // Handle signup
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              email: trimmedEmail,
            }
          }
        });

        if (error) {
          console.error('Signup error:', error);
          if (error.message.includes('User already registered')) {
            toast.error("Este correo ya está registrado. Por favor, inicie sesión.");
            setIsLogin(true);
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }

        if (data.user) {
          toast.success("Cuenta creada exitosamente. Por favor verifica tu correo electrónico.");
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error("Error en la autenticación. Por favor intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Plataforma de Eficiencia Energética</CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Ingrese sus credenciales para acceder" : "Cree una nueva cuenta"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAuth} className="space-y-4">
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
              {loading ? "Procesando..." : (isLogin ? "Iniciar Sesión" : "Registrarse")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
