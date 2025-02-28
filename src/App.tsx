
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "@/pages/Home";
import AboutUs from "@/pages/AboutUs";
import ContactPage from "@/pages/ContactPage";
import ServicesPage from "@/pages/ServicesPage";
import ServiceDemanda from "@/pages/ServiceDemanda";
import ServiceDiagnostico from "@/pages/ServiceDiagnostico";
import ServiceEfficiency from "@/pages/ServiceEfficiency";
import ServiceContractual from "@/pages/ServiceControl";
import DashboardPage from "@/pages/DashboardPage";
import AdminPanel from "@/pages/AdminPanel";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";
import ProfilePage from "@/pages/ProfilePage";
import InformesPage from "@/pages/InformesPage";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isSuperUser } = useUserProfile();

  useEffect(() => {
    // Check and set initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children, requireSuperUser = false }: { children: JSX.Element, requireSuperUser?: boolean }) => {
    if (loading) return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
    
    if (!session) {
      return <Navigate to="/login" />;
    }

    if (requireSuperUser && !isSuperUser) {
      return <Navigate to="/dashboard" />;
    }

    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Página de login independiente */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Páginas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/service-demanda" element={<ServiceDemanda />} />
        <Route path="/service-diagnostico" element={<ServiceDiagnostico />} />
        <Route path="/service-efficiency" element={<ServiceEfficiency />} />
        <Route path="/service-contractual" element={<ServiceContractual />} />
        
        {/* Páginas protegidas */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/informes" element={<ProtectedRoute><InformesPage /></ProtectedRoute>} />
        
        {/* Páginas de administrador */}
        <Route path="/admin/panel" element={<ProtectedRoute requireSuperUser={true}><AdminPanel /></ProtectedRoute>} />
        
        {/* Página 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
