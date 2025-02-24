
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lightbulb, Check, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";

const ServiceEfficiency = () => {
  const navigate = useNavigate();

  return (
    <main className="pt-16">
      <section className="bg-gradient-to-b from-white to-sergen-50/30 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="mb-8 flex justify-center">
              <div className="h-16 w-16 rounded-full bg-sergen-100 flex items-center justify-center">
                <Lightbulb className="h-8 w-8 text-sergen-700" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-6">
              Proyectos de Eficiencia Energética: Soluciones a Medida
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Desarrollamos proyectos integrales de eficiencia energética, desde el diseño 
              hasta la implementación. Utilizamos tecnologías innovadoras y sostenibles 
              para optimizar el consumo de energía, reducir costos operativos y minimizar 
              el impacto ambiental.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 h-full">
                <div className="mb-4">
                  <Check className="h-8 w-8 text-sergen-600" />
                </div>
                <h2 className="text-2xl font-semibold mb-4">Beneficios</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-sergen-500 mt-1 flex-shrink-0" />
                    <span>Reducción de costos energéticos</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-sergen-500 mt-1 flex-shrink-0" />
                    <span>Implementación de tecnologías sostenibles</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-sergen-500 mt-1 flex-shrink-0" />
                    <span>Mejora de la competitividad y productividad</span>
                  </li>
                </ul>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 h-full">
                <div className="mb-4">
                  <ListChecks className="h-8 w-8 text-sergen-600" />
                </div>
                <h2 className="text-2xl font-semibold mb-4">Proceso</h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-sergen-500 mt-1 flex-shrink-0" />
                    <span>Diagnóstico y análisis inicial</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-sergen-500 mt-1 flex-shrink-0" />
                    <span>Diseño de soluciones personalizadas</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-sergen-500 mt-1 flex-shrink-0" />
                    <span>Implementación y seguimiento</span>
                  </li>
                </ul>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-sergen-50/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              ¿Listo para optimizar tu consumo energético?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Contáctanos para una consulta gratuita
            </p>
            <Button 
              onClick={() => navigate("/contacto")}
              className="bg-sergen-500 text-white hover:bg-sergen-600"
              size="lg"
            >
              Solicitar Consulta
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default ServiceEfficiency;
