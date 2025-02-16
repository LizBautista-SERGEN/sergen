
import { LineChart, LayoutGrid, Coins, ChartBar } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: <ChartBar className="h-8 w-8 text-white" />,
      title: "Trayectoria",
      description: "Tenemos diversos casos de éxito en el mercado, esta experiencia nos permite brindarle soluciones integrales que satisfagan las expectativas de los clientes."
    },
    {
      icon: <LayoutGrid className="h-8 w-8 text-white" />,
      title: "Fexibilidad",
      description: "Estamos capacitados para proporcionar servicios innovadores y de alta calidad en distintas áreas, gracias a nuestra amplia experiencia y conocimiento."
    },
    {
      icon: <LineChart className="h-8 w-8 text-white" />,
      title: "Mejora continua",
      description: "Nuestro mayor compromiso es mantener una mejora continua en nuestros procesos y servicios enfocados en brindar la mayor calidad."
    },
    {
      icon: <Coins className="h-8 w-8 text-white" />,
      title: "Rentabilidad",
      description: "Nos esforzamos por optimizar el uso de los recursos corporativos en cada proceso; lo que nos permite presentar precios competitivos a nuestros clientes."
    }
  ];

  return (
    <section className="bg-sergen-600 py-24">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <h2 className="mb-6 text-4xl font-bold text-white">
            Por qué elegirnos
          </h2>
        </AnimatedSection>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, index) => (
            <AnimatedSection key={index}>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sergen-500">
                  {reason.icon}
                </div>
                <h3 className="mb-4 text-2xl font-bold text-[#f39200]">{reason.title}</h3>
                <p className="text-black">{reason.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
