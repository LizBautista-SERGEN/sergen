
import { Gauge, FileSpreadsheet, Lightbulb, Search } from "lucide-react";
import ServiceCard from "./ServiceCard";
import AnimatedSection from "./AnimatedSection";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const navigate = useNavigate();
  
  const services = [
    {
      title: "Diagnóstico Energético",
      subtitle: "Maximiza tu Eficiencia y Reduce Costos",
      description: "Realizamos un análisis exhaustivo de tus sistemas energéticos para detectar los principales focos de consumo. Nuestro equipo identifica áreas de mejora y te ofrece un plan personalizado con medidas concretas para reducir tu consumo energético y optimizar costos.",
      icon: <Search className="h-6 w-6" />,
      path: "/servicios/diagnostico",
      image: "/lovable-uploads/c6e04f82-2e00-4e2f-8add-0e2bd586449b.png"
    },
    {
      title: "Control de Demanda",
      subtitle: "Reduce tu Factura Eléctrica",
      description: "Implementamos estrategias avanzadas de gestión de demanda energética para optimizar tu consumo y reducir costos. Nuestras soluciones te permiten alcanzar ahorros significativos en tu factura eléctrica, mejorando la eficiencia operativa de tu empresa.",
      icon: <Gauge className="h-6 w-6" />,
      path: "/servicios/demanda",
      image: "/lovable-uploads/65c0f958-3c27-4e19-9a03-62c16c1c3e7b.png"
    },
    {
      title: "Gestión Contractual",
      subtitle: "Optimiza tus Contratos de Suministros",
      description: "Nuestro equipo se encarga de revisar, analizar y negociar los términos y condiciones de tus contratos de suministros. Aseguramos que cada cláusula se ajuste a tus necesidades y proteja tus intereses, garantizando tarifas competitivas y condiciones favorables.",
      icon: <FileSpreadsheet className="h-6 w-6" />,
      path: "/servicios/contractual",
      image: "/lovable-uploads/823922c8-88ef-4fb4-903c-59bcdadcb1ab.png"
    },
    {
      title: "Proyectos de Eficiencia Energética",
      subtitle: "Soluciones a Medida",
      description: "Desarrollamos proyectos integrales de eficiencia energética, desde el diseño hasta la implementación. Utilizamos tecnologías innovadoras y sostenibles para optimizar el consumo de energía, reducir costos operativos y minimizar el impacto ambiental.",
      icon: <Lightbulb className="h-6 w-6" />,
      path: "/servicios/efficiency",
      image: "/lovable-uploads/83c2fa60-245f-494f-9474-15cadb818eb1.png"
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
            Identificamos oportunidades de ahorro y proponemos soluciones personalizadas para reducir tu consumo energético.
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
