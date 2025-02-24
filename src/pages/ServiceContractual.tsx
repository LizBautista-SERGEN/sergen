
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Check } from "lucide-react";

const ServiceContractual = () => {
  const navigate = useNavigate();

  const benefits = [
    "Negociación de tarifas y condiciones contractuales",
    "Protección de tus intereses legales y financieros",
    "Negociación de suministro con generadoras"
  ];

  const process = [
    "Revisión de contratos actuales",
    "Negociación y ajuste de términos",
    "Firma de contrato o adenda"
  ];

  return (
    <main className="pt-16">
      <section className="bg-gradient-to-b from-white to-sergen-50/30 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="mb-8 flex justify-center">
              <div className="h-16 w-16 rounded-full bg-sergen-100 flex items-center justify-center">
                <FileSpreadsheet className="h-8 w-8 text-sergen-700" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-6 text-center">Gestión Contractual: Optimiza tus Contratos de Suministros</h1>
            <p className="text-lg text-gray-600 mb-12 text-center">
              Nuestro equipo se encarga de revisar, analizar y negociar los términos y condiciones de tus contratos de suministros. 
              Aseguramos que cada cláusula se ajuste a tus necesidades y proteja tus intereses, garantizando tarifas competitivas 
              y condiciones favorables.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-sergen-600">Beneficios</h2>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-sergen-500" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-sergen-600">Proceso</h2>
                <ul className="space-y-3">
                  {process.map((step, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-sergen-100 flex items-center justify-center text-sergen-600 font-bold">
                        {index + 1}
                      </div>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">¿Necesitas ayuda con tus contratos de suministros?</h3>
              <Button 
                onClick={() => navigate("/contacto")}
                className="bg-sergen-500 text-white hover:bg-sergen-600"
              >
                Solicitar Consulta Gratuita
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default ServiceContractual;
