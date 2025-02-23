
import { StrictMode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import ServicesPage from "./pages/ServicesPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import ServiceDiagnostico from "./pages/ServiceDiagnostico";
import ServiceControl from "./pages/ServiceControl";
import ServiceContractual from "./pages/ServiceContractual";
import ServiceEfficiency from "./pages/ServiceEfficiency";
import ServiceDemanda from "./pages/ServiceDemanda";
import ProfilePage from "./pages/ProfilePage";
import InformesPage from "./pages/InformesPage";
import UserDemo from "./pages/UserDemo";
import { useAuth } from "./hooks/useAuth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: 1,
      },
    },
  });

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <TooltipProvider>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/nosotros" element={<AboutUs />} />
                  <Route path="/servicios" element={<ServicesPage />} />
                  <Route path="/servicios/diagnostico" element={<ServiceDiagnostico />} />
                  <Route path="/servicios/demanda" element={<ServiceDemanda />} />
                  <Route path="/servicios/control" element={<ServiceControl />} />
                  <Route path="/servicios/contractual" element={<ServiceContractual />} />
                  <Route path="/servicios/efficiency" element={<ServiceEfficiency />} />
                  <Route path="/contacto" element={<ContactPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route 
                    path="/perfil" 
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/informes" 
                    element={
                      <ProtectedRoute>
                        <InformesPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/demo" element={<UserDemo />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </main>
            <Footer />
            <Toaster />
            <Sonner />
          </div>
        </Router>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
