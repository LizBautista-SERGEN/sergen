
import { Gauge, FileSpreadsheet, Lightbulb, Search } from "lucide-react";
import ServiceCard from "./ServiceCard";
import AnimatedSection from "./AnimatedSection";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const navigate = useNavigate();
  
  const services = [
    {
      title: "Diagnóstico Energético",
      description:
        "Se detecta los principales focos de consumo con el fin de identificar las áreas con mayor potencial de ahorro. Además, sugiere medidas de mejora para reducir dicho consumo, evaluando tanto el ahorro esperado como la inversión requerida.",
      icon: <Search className="h-6 w-6" />,
      path: "/servicios/diagnostico",
      image: "/lovable-uploads/46924861-677a-4a17-b6fe-666de8979766.png"
    },
    {
      title: "Control de Demanda",
      description:
        "Se proporciona a los usuarios un plan operativo de gestión energética para lograr reducciones en factura eléctrica de hasta el 50%.",
      icon: <Gauge className="h-6 w-6" />,
      path: "/servicios/demanda",
      image: "/placeholder.svg"
    },
    {
      title: "Gestión Contractual",
      description:
        "Nuestro servicio de gestión contractual se encarga de analizar, revisar y negociar los términos, cláusulas y condiciones de los contratos de suministros, asegurando que se ajusten a tus necesidades y protejan tus intereses.",
      icon: <FileSpreadsheet className="h-6 w-6" />,
      path: "/servicios/contractual",
      image: "/lovable-uploads/823922c8-88ef-4fb4-903c-59bcdadcb1ab.png"
    },
    {
      title: "Proyectos de Eficiencia",
      description:
        "En nuestros proyectos de eficiencia energética, diseñamos e implementamos soluciones personalizadas para optimizar el consumo de energía en tu empresa o instalaciones. Realizamos un análisis integral de tus procesos y sistemas para identificar oportunidades de ahorro, reducir costos operativos y minimizar el impacto ambiental.",
      icon: <Lightbulb className="h-6 w-6" />,
      path: "/servicios/efficiency",
      image: "/lovable-uploads/3c26af1d-33a0-4496-bb07-534d6f16f370.png"
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

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {services.map((service, index) => (
            <AnimatedSection key={index} className="h-full">
              <ServiceCard {...service} onClick={service.path ? () => navigate(service.path) : undefined} />
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
