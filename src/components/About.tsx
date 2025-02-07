import AnimatedSection from "./AnimatedSection";

const About = () => {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <AnimatedSection>
            <div className="relative h-[400px] overflow-hidden rounded-2xl">
              <img
                src="/placeholder.svg"
                alt="Equipo SERGEN"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <span className="mb-4 inline-block rounded-full bg-sergen-100 px-4 py-1.5 text-sm font-medium text-sergen-800">
              Sobre Nosotros
            </span>
            <h2 className="mb-6 text-4xl font-bold text-gray-900">
              Expertos en Eficiencia Energética
            </h2>
            <p className="mb-6 text-lg text-gray-600">
              En SERGEN, nos dedicamos a transformar la manera en que las empresas
              gestionan su energía. Con años de experiencia y un equipo altamente
              calificado, desarrollamos soluciones personalizadas que garantizan
              resultados medibles y sostenibles.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="mb-2 text-2xl font-bold text-sergen-600">100+</h4>
                <p className="text-gray-600">Proyectos Completados</p>
              </div>
              <div>
                <h4 className="mb-2 text-2xl font-bold text-sergen-600">30%</h4>
                <p className="text-gray-600">Ahorro Promedio</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default About;