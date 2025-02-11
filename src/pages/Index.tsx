
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Sustainability from "@/components/Sustainability";
import AnimatedSection from "@/components/AnimatedSection";
import { ChartBarIncreasing, Handshake } from "lucide-react";

const Index = () => {
  const differentiators = [
    {
      icon: <Handshake className="h-8 w-8 text-sergen-500" />,
      title: "Trayectoria",
      description: "3 años construyendo relaciones duraderas con nuestros clientes, respaldados por sus recomendaciones y confianza continua."
    },
    {
      icon: <ChartBarIncreasing className="h-8 w-8 text-sergen-500" />,
      title: "Rentabilidad",
      description: "Ofrecemos propuestas económicas y efectivas, donde nuestra experiencia y compromiso generan un valor superior a la inversión."
    }
  ];

  return (
    <div className="flex flex-col w-full">
      <Hero />
      <Services />
      <About />
      
      <section id="differentiators" className="w-full bg-gray-50 py-24 mt-12">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <span className="mb-4 inline-block rounded-full bg-sergen-100 px-4 py-1.5 text-sm font-medium text-sergen-800">
              ¿Por qué elegirnos?
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Lo que nos diferencia
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nuestro compromiso es brindar soluciones energéticas efectivas y accesibles
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {differentiators.map((item, index) => (
              <AnimatedSection 
                key={index}
                className="bg-white p-10 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6 p-4 bg-sergen-50 rounded-full">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {item.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <Sustainability />
      <Contact />
    </div>
  );
};

export default Index;
