
import About from "@/components/About";
import AnimatedSection from "@/components/AnimatedSection";
import { Gear, Leaf, Heart, Trophy } from "lucide-react";

const AboutUs = () => {
  const values = [
    {
      title: "Innovación",
      description: "Buscamos constantemente nuevas formas de optimizar el consumo energético, utilizando tecnología de vanguardia y soluciones creativas.",
      icon: <Gear className="h-8 w-8 text-sergen-600" />,
    },
    {
      title: "Sostenibilidad",
      description: "Nos comprometemos a reducir el impacto ambiental de nuestros clientes, promoviendo prácticas responsables y el uso de energías limpias.",
      icon: <Leaf className="h-8 w-8 text-sergen-600" />,
    },
    {
      title: "Compromiso",
      description: "Trabajamos con dedicación y pasión para superar las expectativas de nuestros clientes, entregando resultados tangibles y de alta calidad.",
      icon: <Heart className="h-8 w-8 text-sergen-600" />,
    },
    {
      title: "Excelencia",
      description: "Nos esforzamos por la mejora continua en todos nuestros procesos, asegurando la máxima eficiencia y satisfacción en cada proyecto.",
      icon: <Trophy className="h-8 w-8 text-sergen-600" />,
    },
  ];

  return (
    <main className="pt-16">
      <About />
      <section className="bg-sergen-50/30 py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Nuestra Misión</h2>
            <p className="text-lg text-gray-600 mb-12">
              Nuestra misión es transformar la gestión energética de las empresas industriales, 
              ofreciendo soluciones innovadoras y sostenibles que maximicen la eficiencia, 
              reduzcan costos operativos y minimicen el impacto ambiental. Nos comprometemos 
              a ser aliados estratégicos de nuestros clientes, ayudándoles a alcanzar sus 
              objetivos de productividad y sostenibilidad.
            </p>
          </AnimatedSection>

          <AnimatedSection className="mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Nuestra Visión</h2>
            <p className="text-lg text-gray-600 mb-12">
              Nuestra visión es ser líderes en soluciones energéticas sostenibles en 
              Latinoamérica, reconocidos por nuestra innovación, calidad y compromiso con 
              el medio ambiente. Aspiramos a ser el partner estratégico de las empresas 
              que buscan transformar su gestión energética y contribuir a un futuro más 
              verde y rentable.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Nuestros Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-lg">
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-center">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;
