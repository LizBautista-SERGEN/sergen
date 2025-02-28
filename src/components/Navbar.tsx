import { useEffect, useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { profile, isLoading } = useUserProfile();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Sesión cerrada exitosamente");
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          <a href="/" className="flex items-center space-x-3">
            <img
              src="/lovable-uploads/823922c8-88ef-4fb4-903c-59bcdadcb1ab.png"
              alt="Sergen Logo"
              className="h-10 w-auto"
            />
            <span
              className={`font-bold text-xl ${
                isScrolled ? "text-sergen-800" : "text-gray-800"
              }`}
            >
              SERGEN
            </span>
          </a>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-10">
            <a
              href="/"
              className={`${
                isScrolled ? "text-gray-700" : "text-gray-800"
              } hover:text-sergen-500 transition-colors`}
            >
              Inicio
            </a>
            <a
              href="/services"
              className={`${
                isScrolled ? "text-gray-700" : "text-gray-800"
              } hover:text-sergen-500 transition-colors`}
            >
              Servicios
            </a>
            <a
              href="/about"
              className={`${
                isScrolled ? "text-gray-700" : "text-gray-800"
              } hover:text-sergen-500 transition-colors`}
            >
              Nosotros
            </a>
            <a
              href="/contact"
              className={`${
                isScrolled ? "text-gray-700" : "text-gray-800"
              } hover:text-sergen-500 transition-colors`}
            >
              Contacto
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700"
            onClick={toggleMobileMenu}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-lg p-4 transition-all duration-300">
            <a
              href="/"
              className="block py-2 text-gray-700 hover:text-sergen-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Inicio
            </a>
            <a
              href="/services"
              className="block py-2 text-gray-700 hover:text-sergen-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Servicios
            </a>
            <a
              href="/about"
              className="block py-2 text-gray-700 hover:text-sergen-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Nosotros
            </a>
            <a
              href="/contact"
              className="block py-2 text-gray-700 hover:text-sergen-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contacto
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
