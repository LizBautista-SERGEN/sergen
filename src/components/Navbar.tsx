import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

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
      await supabase.auth.signOut();
      toast.success("Sesión cerrada correctamente");
      setIsLoggedIn(false);
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { text: "Inicio", href: "/" },
    { text: "Nosotros", href: "/nosotros" },
    { text: "Servicios", href: "/servicios" },
    { text: "Contacto", href: "/contacto" },
  ];

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
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-gray-600 hover:text-sergen-500 transition-colors"
              >
                {item.text}
              </Link>
            ))}
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-sergen-500 transition-colors"
                >
                  Dashboard
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="text-sergen-500 hover:text-sergen-600"
                >
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button
                  variant="default"
                  className="bg-sergen-500 hover:bg-sergen-600 text-white"
                >
                  Iniciar Sesión
                </Button>
              </Link>
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
            {menuItems.map((item) => (
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
              <>
                <Link
                  to="/dashboard"
                  className="block text-gray-600 hover:text-sergen-500 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left text-gray-600 hover:text-sergen-500 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block text-gray-600 hover:text-sergen-500 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
