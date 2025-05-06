import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import ServiceControl from './pages/ServiceControl';
import ServiceDiagnostico from './pages/ServiceDiagnostico';
import ServiceContractual from './pages/ServiceContractual';
import ServiceEfficiency from './pages/ServiceEfficiency';
import DashboardPage from './pages/DashboardPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import NotFound from './pages/NotFound';
import { Toaster } from 'sonner';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/servicios/control" element={<ServiceControl />} />
          <Route path="/servicios/diagnostico" element={<ServiceDiagnostico />} />
          <Route path="/servicios/consultoria" element={<ServiceContractual />} />
          <Route path="/servicios/eficiencia" element={<ServiceEfficiency />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/configuracion" element={<ConfiguracionPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
}

export default App;
