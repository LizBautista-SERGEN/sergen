
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useAuthForms } from "@/hooks/useAuthForms";
import { cn } from "@/lib/utils";

const LoginPage = () => {
  const {
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
  } = useAuthForms();

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left side - Background image */}
      <div className="hidden md:block md:w-1/2 lg:w-3/5">
        <div 
          className="h-full bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url("/lovable-uploads/4e259b4d-ce76-41c2-8634-2c0f28d6505b.png")',
            backgroundSize: 'cover'
          }}
        />
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <img 
              src="/lovable-uploads/c9da053f-d6d7-4371-bc94-66f8f73b3933.png" 
              alt="Sergen Energy" 
              className="h-12"
            />
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-8">Iniciar Sesión</h1>
          
          <div className="mb-2 text-center">
            <span className="text-gray-600">¿No tienes cuenta? </span>
            <a href="#" className="text-sergen-500 hover:text-sergen-600 font-medium">
              Regístrate ahora
            </a>
          </div>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className={cn("grid w-full grid-cols-2 mb-6", "hidden")}>
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                loading={loading}
                onSubmit={handleLogin}
              />
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm
                email={email}
                setEmail={setEmail}
                businessName={businessName}
                setBusinessName={setBusinessName}
                ruc={ruc}
                setRuc={setRuc}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                loading={loading}
                onSubmit={handleSignUp}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
