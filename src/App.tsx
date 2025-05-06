
import { StrictMode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import ConfiguracionPage from "./pages/ConfiguracionPage";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <TooltipProvider>
                <Routes>
                  {/* Rutas públicas */}
                  <Route path="/" element={<Home />} />
                  <Route path="/nosotros" element={<AboutUs />} />
                  <Route path="/servicios" element={<ServicesPage />} />
                  <Route path="/servicios/diagnostico" element={<ServiceDiagnostico />} />
                  <Route path="/servicios/demanda" element={<ServiceDemanda />} />
                  <Route path="/servicios/contractual" element={<ServiceContractual />} />
                  <Route path="/servicios/efficiency" element={<ServiceEfficiency />} />
                  <Route path="/contacto" element={<ContactPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  
                  {/* Rutas con layout de dashboard */}
                  <Route element={<DashboardLayout />}>
                    <Route path="/perfil" element={<ProfilePage />} />
                    <Route path="/servicios/control" element={<ServiceControl />} />
                    <Route path="/configuracion" element={<ConfiguracionPage />} />
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </main>
            <Footer />
            <Toaster />
            <Sonner />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>
  );
};

export default App;
