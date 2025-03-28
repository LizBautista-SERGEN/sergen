
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [ruc, setRuc] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error al verificar sesión:', error);
        return;
      }
      
      if (session) {
        console.log('Sesión encontrada:', session);
        // Usamos user_accounts en lugar de profiles
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
        if (profile?.role === 'superuser') {
          navigate('/admin/panel');
        } else {
          navigate('/dashboard');
        }
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
        // Usamos user_accounts en lugar de profiles
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
        if (profile?.role === 'superuser') {
          navigate('/admin/panel');
        } else {
          navigate('/dashboard');
        }
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

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Panel de Control</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginEmail">Correo Electrónico</Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loginPassword">Contraseña</Label>
                  <Input
                    id="loginPassword"
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
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="registerEmail">Correo Electrónico</Label>
                  <Input
                    id="registerEmail"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nombre de la Empresa</Label>
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="Nombre de su empresa"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ruc">RUC</Label>
                  <Input
                    id="ruc"
                    type="text"
                    placeholder="Número de RUC"
                    value={ruc}
                    onChange={(e) => setRuc(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerPassword">Contraseña</Label>
                  <Input
                    id="registerPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-sergen-500 hover:bg-sergen-600"
                  disabled={loading}
                >
                  {loading ? "Procesando..." : "Registrarse"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
