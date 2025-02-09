
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
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

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
        // Sign up process
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              email: email,
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          toast.success("Cuenta creada exitosamente. Por favor inicia sesión.");
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let errorMessage = 'Error en la autenticación';
      
      if (error.message.includes('Email rate limit exceeded')) {
        errorMessage = 'Demasiados intentos. Por favor, espere unos minutos.';
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'Este correo ya está registrado. Por favor, inicie sesión.';
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Credenciales inválidas. Por favor, verifique sus datos.';
      } else if (error.message.includes('Password should be at least 6 characters')) {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Por favor, confirme su correo electrónico antes de iniciar sesión.';
      }
      
      toast.error(errorMessage);
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
