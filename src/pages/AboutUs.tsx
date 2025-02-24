
import About from "@/components/About";
import AnimatedSection from "@/components/AnimatedSection";

const AboutUs = () => {
  return (
    <main className="pt-16">
      <About />
      <section className="bg-sergen-50/30 py-24">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Nuestra Misión</h2>
            <p className="text-lg text-gray-600 mb-12">
              En SERGEN, nos dedicamos a transformar la manera en que las empresas
              gestionan su energía, promoviendo la sostenibilidad y la eficiencia
              energética a través de soluciones innovadoras y personalizadas.
            </p>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;
