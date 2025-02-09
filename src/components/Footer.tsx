
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img
              src="/lovable-uploads/2197224b-fa23-4967-8688-bc80f5152704.png"
              alt="Sergen Logo"
              className="h-12 mb-4"
            />
            <p className="text-gray-400">
              Transformando la gestión energética empresarial con soluciones innovadoras y sostenibles.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-sergen-500">Inicio</Link></li>
              <li><Link to="/nosotros" className="text-gray-400 hover:text-sergen-500">Nosotros</Link></li>
              <li><Link to="/servicios" className="text-gray-400 hover:text-sergen-500">Servicios</Link></li>
              <li><Link to="/contacto" className="text-gray-400 hover:text-sergen-500">Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-sergen-500 transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-sergen-500 transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-sergen-500 transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-sergen-500 transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} SERGEN. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
