
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Graph, LineChart, GitGraph, Share2 } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const ServiceControl = () => {
  const navigate = useNavigate();

  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-sergen-50/30 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="mb-8 flex justify-center">
              <div className="h-16 w-16 rounded-full bg-sergen-100 flex items-center justify-center">
                <Graph className="h-8 w-8 text-sergen-700" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-6">Control de Demanda</h1>
            <p className="text-lg text-gray-600 mb-8">
              Optimiza el consumo energético de tu empresa con nuestro sistema de monitoreo y control en tiempo real.
            </p>
            <Button 
              onClick={() => navigate("/contacto")}
              className="bg-sergen-500 text-white hover:bg-sergen-600"
            >
              Solicitar Demostración
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedSection>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <LineChart className="h-12 w-12 text-sergen-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Monitoreo en Tiempo Real</h3>
                <p className="text-gray-600">
                  Visualiza y analiza el consumo energético de tu empresa en tiempo real para tomar decisiones informadas.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <GitGraph className="h-12 w-12 text-sergen-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Gestión Inteligente</h3>
                <p className="text-gray-600">
                  Implementa estrategias de control automático para optimizar el consumo en horas pico.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Share2 className="h-12 w-12 text-sergen-500 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Reportes Detallados</h3>
                <p className="text-gray-600">
                  Recibe informes periódicos con análisis detallados y recomendaciones de mejora.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Beneficios del Control de Demanda</h2>
            <div className="space-y-6">
              <div className="p-4 border border-sergen-100 rounded-lg bg-sergen-50">
                <p className="text-gray-700">Reducción significativa en costos de energía</p>
              </div>
              <div className="p-4 border border-sergen-100 rounded-lg bg-sergen-50">
                <p className="text-gray-700">Mayor eficiencia en el uso de recursos energéticos</p>
              </div>
              <div className="p-4 border border-sergen-100 rounded-lg bg-sergen-50">
                <p className="text-gray-700">Cumplimiento de normativas y estándares ambientales</p>
              </div>
              <div className="p-4 border border-sergen-100 rounded-lg bg-sergen-50">
                <p className="text-gray-700">Mejora en la sostenibilidad de tu empresa</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-sergen-500">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-6">¿Listo para optimizar tu consumo energético?</h2>
            <p className="mb-8 text-lg">
              Contacta con nuestros expertos y descubre cómo podemos ayudarte.
            </p>
            <Button 
              onClick={() => navigate("/contacto")}
              className="bg-white text-sergen-500 hover:bg-gray-100"
            >
              Contactar Ahora
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ServiceControl;
