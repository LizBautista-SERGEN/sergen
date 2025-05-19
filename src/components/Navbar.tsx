
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isInDashboard = location.pathname.startsWith('/perfil') || 
                       location.pathname.startsWith('/servicios/control') || 
                       location.pathname.startsWith('/reportes') || 
                       location.pathname.startsWith('/configuracion') ||
                       location.pathname.startsWith('/lista-espera');

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
  };

  const handleLogout = async () => {
    try {
      setIsLoggedIn(false); // Immediately update UI state
      
      // Attempt to sign out
      const { error } = await supabase.auth.signOut();
      
      // Handle possible errors gracefully
      if (error) {
        console.log('Logout error handled:', error.message);
        // We don't show error to user since we already updated the UI state
      }
      
      // Continue with logout flow regardless of error
      toast.success("Sesión cerrada correctamente");
      navigate("/");
      
    } catch (error: any) {
      console.error("Error inesperado al cerrar sesión:", error);
      // Even if there's an unexpected error, ensure the user is logged out in the UI
      toast.success("Sesión cerrada correctamente");
      navigate("/");
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { text: "Inicio", href: "/" },
    { text: "Nosotros", href: "/nosotros" },
    { text: "Servicios", href: "/servicios" },
    { text: "Contacto", href: "/contacto" },
  ];

  // Only show dashboard link if user is logged in
  const dashboardMenuItems = isLoggedIn ? [
    { text: "Mi Plataforma", href: "/perfil" }
  ] : [];

  // Combine the menu items
  const allMenuItems = [...menuItems, ...dashboardMenuItems];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img
              src="/lovable-uploads/12ae4369-c1d4-4066-b8c6-b5d4060a8d15.png"
              alt="Sergen Logo"
              className="h-10"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {allMenuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-gray-600 hover:text-sergen-500 transition-colors"
              >
                {item.text}
              </Link>
            ))}
            {isLoggedIn ? (
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-sergen-500 hover:text-sergen-600"
              >
                Cerrar Sesión
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="text-sergen-500 hover:text-sergen-600 flex items-center gap-2"
              >
                <LogIn size={16} /> Iniciar Sesión
              </Button>
            )}
          </div>

          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-600 hover:text-sergen-500"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-white border-t"
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            {allMenuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="block text-gray-600 hover:text-sergen-500 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.text}
              </Link>
            ))}
            {isLoggedIn ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block w-full text-left text-gray-600 hover:text-sergen-500 transition-colors"
              >
                Cerrar Sesión
              </button>
            ) : (
              <button 
                onClick={() => {
                  navigate('/login');
                  setIsOpen(false);
                }}
                className="block w-full text-left text-gray-600 hover:text-sergen-500 transition-colors flex items-center gap-2"
              >
                <LogIn size={16} /> Iniciar Sesión
              </button>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
