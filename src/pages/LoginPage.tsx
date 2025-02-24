
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const navigate = useNavigate();

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

      console.log('Attempting login for:', trimmedEmail);

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (authError) {
        console.error('Login error:', authError);
        toast.error("Error al iniciar sesión");
        setLoading(false);
        return;
      }

      if (!authData.user) {
        console.error('No user data received');
        toast.error("Error al iniciar sesión");
        setLoading(false);
        return;
      }

      console.log('Login successful, fetching profile');

      // Obtener el rol del usuario con maybeSingle
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, has_access')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
        toast.error("Error al obtener el perfil");
        setLoading(false);
        return;
      }

      if (!profileData) {
        console.error('No profile found for user:', authData.user.id);
        toast.error("No se encontró el perfil del usuario");
        setLoading(false);
        return;
      }

      if (!profileData.has_access) {
        toast.error("Su cuenta no tiene acceso al sistema");
        // Cerrar sesión si no tiene acceso
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      console.log('Profile data:', profileData);
      toast.success("Inicio de sesión exitoso");
      
      // Redirigir según el rol
      if (profileData.role === 'superuser') {
        navigate('/admin/panel');
      } else {
        navigate('/servicios/control');
      }
      
    } catch (error) {
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
          <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
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
