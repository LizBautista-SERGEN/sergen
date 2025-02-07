import { Gauge, FileSpreadsheet, Lightbulb } from "lucide-react";
import ServiceCard from "./ServiceCard";
import AnimatedSection from "./AnimatedSection";

const Services = () => {
  const services = [
    {
      title: "Control de Demanda",
      description:
        "Optimizamos el consumo energético mediante monitoreo en tiempo real y ajustes automáticos.",
      icon: <Gauge className="h-6 w-6" />,
    },
    {
      title: "Gestión Contractual",
      description:
        "Analizamos y optimizamos tus contratos energéticos para maximizar el ahorro.",
      icon: <FileSpreadsheet className="h-6 w-6" />,
    },
    {
      title: "Proyectos de Eficiencia",
      description:
        "Implementamos soluciones integrales para mejorar la eficiencia energética.",
      icon: <Lightbulb className="h-6 w-6" />,
    },
  ];

  return (
    <section
      id="services"
      className="bg-gradient-to-b from-white to-sergen-50/30 py-24"
    >
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-sergen-100 px-4 py-1.5 text-sm font-medium text-sergen-800">
            Nuestros Servicios
          </span>
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Soluciones Integrales
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Ofrecemos un conjunto completo de servicios diseñados para optimizar tu
            consumo energético y reducir costos operativos.
          </p>
        </AnimatedSection>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <AnimatedSection key={index} className="h-full">
              <ServiceCard {...service} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;