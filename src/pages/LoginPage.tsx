
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useAuthForms } from "@/hooks/useAuthForms";
import { cn } from "@/lib/utils";
import { SubscriptionPlansModal } from "@/components/subscription/SubscriptionPlansModal";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const LoginPage = () => {
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
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

  const [showPlans, setShowPlans] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setCheckingSession(true);
        const { data } = await supabase.auth.getSession();
        
        // Only redirect if there's an active session
        if (data.session) {
          setRedirecting(true);
          navigate('/servicios/control');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setCheckingSession(false);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  // Don't render the login form if we're redirecting or still checking session
  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-sergen-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo a la plataforma...</p>
        </div>
      </div>
    );
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-sergen-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

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
              src="/lovable-uploads/a21e0ab8-46e2-4393-a7f4-c67f491d745e.png" 
              alt="Sergen Energy" 
              className="h-12"
            />
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-8">Iniciar Sesión</h1>
          
          <div className="mb-2 text-center">
            <span className="text-gray-600">¿No tienes cuenta? </span>
            <button 
              onClick={() => setShowPlans(true)}
              className="text-sergen-500 hover:text-sergen-600 font-medium"
            >
              Regístrate ahora
            </button>
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

      {/* Subscription Plans Modal */}
      <SubscriptionPlansModal open={showPlans} onOpenChange={setShowPlans} />
    </div>
  );
};

export default LoginPage;
