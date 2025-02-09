
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StrictMode } from "react";
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
import DashboardPage from "./pages/DashboardPage";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Navbar />
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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);

export default App;
