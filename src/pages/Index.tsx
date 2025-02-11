
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Contact from "@/components/Contact";
import { Award, ShieldCheck, Star } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import Sustainability from "@/components/Sustainability";

const Index = () => {
  const differentiators = [
    {
      icon: <Award className="h-8 w-8 text-sergen-500" />,
      title: "Experiencia Comprobada",
      description: "Más de 10 años transformando la eficiencia energética empresarial"
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-sergen-500" />,
      title: "Tecnología de Vanguardia",
      description: "Soluciones innovadoras y personalizadas para cada cliente"
    },
    {
      icon: <Star className="h-8 w-8 text-sergen-500" />,
      title: "Resultados Garantizados",
      description: "Compromiso con la optimización y ahorro energético medible"
    }
  ];

  return (
    <div className="flex flex-col w-full">
      <Hero />
      
      <div className="flex flex-col w-full min-h-screen">
        <section id="presentation" className="w-full bg-white py-24">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Soluciones Energéticas de Última Generación
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Utilizamos tecnología avanzada y experiencia comprobada para optimizar el consumo energético de tu empresa, 
                garantizando ahorros significativos y un futuro más sostenible.
              </p>
            </AnimatedSection>
          </div>
        </section>

        <Services />
        <About />
        
        <section id="differentiators" className="w-full bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center mb-12">
              <span className="mb-4 inline-block rounded-full bg-sergen-100 px-4 py-1.5 text-sm font-medium text-sergen-800">
                ¿Por qué elegirnos?
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Lo que nos diferencia
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                En Sergen, nos destacamos por nuestro compromiso con la excelencia y la innovación en eficiencia energética
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {differentiators.map((item, index) => (
                <AnimatedSection 
                  key={index}
                  className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 p-3 bg-sergen-50 rounded-full">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <Sustainability />
        <Sustainability />
        <Sustainability />

        <Contact />
      </div>
    </div>
  );
};

export default Index;
