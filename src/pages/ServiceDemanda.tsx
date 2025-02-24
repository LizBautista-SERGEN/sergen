
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gauge, Check } from "lucide-react";

const ServiceDemanda = () => {
  const navigate = useNavigate();

  const benefits = [
    "Reducción de hasta un 50% en la factura eléctrica",
    "Optimización del consumo energético",
    "Planes operativos personalizados"
  ];

  const process = [
    "Análisis de patrones de consumo",
    "Diseño de un plan de gestión de demanda",
    "Acceso a plataforma y monitoreo continuo"
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
                <Gauge className="h-8 w-8 text-sergen-700" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-6 text-center">Control de Demanda: Reduce tu Factura Eléctrica</h1>
            <p className="text-lg text-gray-600 mb-12 text-center">
              Implementamos estrategias avanzadas de gestión de demanda energética para optimizar tu consumo y reducir costos. 
              Nuestras soluciones te permiten alcanzar ahorros significativos en tu factura eléctrica, mejorando la eficiencia 
              operativa de tu empresa.
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
              <h3 className="text-2xl font-bold mb-4">¿Quieres reducir tu factura eléctrica?</h3>
              <Button 
                onClick={() => navigate("/contacto")}
                className="bg-sergen-500 text-white hover:bg-sergen-600"
              >
                Solicitar Más Información
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default ServiceDemanda;
