
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const toggleMenu = () => setIsOpen(!isOpen);

  const scrollToSection = (sectionId: string) => {
    if (!isHome) {
      window.location.href = `/#${sectionId}`;
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const menuItems = [
    { text: "Inicio", action: () => scrollToSection("hero") },
    { text: "Nosotros", action: () => scrollToSection("about") },
    { text: "Servicios", action: () => scrollToSection("services") },
    { text: "Contacto", action: () => scrollToSection("contact") },
    { text: "Iniciar Sesión", href: "/login" },
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

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {menuItems.map((item, index) => (
              item.href ? (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-gray-600 hover:text-sergen-500 transition-colors"
                >
                  {item.text}
                </Link>
              ) : (
                <button
                  key={index}
                  onClick={item.action}
                  className="text-gray-600 hover:text-sergen-500 transition-colors"
                >
                  {item.text}
                </button>
              )
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-600 hover:text-sergen-500"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-white border-t"
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            {menuItems.map((item, index) => (
              item.href ? (
                <Link
                  key={item.href}
                  to={item.href}
                  className="block text-gray-600 hover:text-sergen-500 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.text}
                </Link>
              ) : (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left text-gray-600 hover:text-sergen-500 transition-colors"
                >
                  {item.text}
                </button>
              )
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
