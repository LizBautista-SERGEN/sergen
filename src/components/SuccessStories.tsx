
import { Building2, Factory, Building } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const SuccessStories = () => {
  const stories = [
    {
      title: "Complejo Industrial Reducción del 40%",
      description:
        "Implementamos soluciones de eficiencia energética que resultaron en una reducción del 40% en el consumo mensual.",
      icon: <Factory className="h-12 w-12" />,
      savings: "40%",
    },
    {
      title: "Centro Comercial Optimización Total",
      description:
        "Optimizamos los sistemas de climatización e iluminación, logrando un ahorro anual significativo en costos energéticos.",
      icon: <Building2 className="h-12 w-12" />,
      savings: "35%",
    },
    {
      title: "Edificio Corporativo Smart Energy",
      description:
        "Instalación de sistemas inteligentes de gestión energética que permitieron una reducción sustancial en el consumo.",
      icon: <Building className="h-12 w-12" />,
      savings: "45%",
    },
  ];

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-sergen-100 px-4 py-1.5 text-sm font-medium text-sergen-800">
            Casos de Éxito
          </span>
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Historias de Transformación Energética
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Descubre cómo hemos ayudado a empresas a optimizar su consumo energético y reducir costos operativos.
          </p>
        </AnimatedSection>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story, index) => (
            <AnimatedSection key={index}>
              <div className="group relative overflow-hidden rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-sergen-50/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-lg bg-sergen-100 p-3 text-sergen-700">
                      {story.icon}
                    </div>
                    <span className="text-3xl font-bold text-sergen-600">
                      {story.savings}
                    </span>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    {story.title}
                  </h3>
                  <p className="text-gray-600">{story.description}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
