
import { MapPin, Facebook, Linkedin } from "lucide-react";
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
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#f39200]" />
                <p className="text-gray-400">Mz B Lt 11 Las Palmeras – Ate Vetarte – Lima</p>
              </div>
              <a 
                href="https://wa.me/51985138443" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-full text-white transition-colors"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/767px-WhatsApp.svg.png" 
                  alt="WhatsApp" 
                  className="h-5 w-5"
                />
                Contáctanos
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              {[
                { to: "/", text: "Inicio" },
                { to: "/nosotros", text: "Nosotros" },
                { to: "/servicios", text: "Servicios" },
                { to: "/contacto", text: "Contacto" }
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-gray-400 hover:text-sergen-500"
                    onClick={() => window.scrollTo(0, 0)}
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              <a 
                href="[tu-url-de-facebook]" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-sergen-500 transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a 
                href="[tu-url-de-linkedin]" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-sergen-500 transition-colors"
              >
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
