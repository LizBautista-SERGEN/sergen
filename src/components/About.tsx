
import AnimatedSection from "./AnimatedSection";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const About = () => {
  const images = [
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg"
  ];

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <AnimatedSection>
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative h-[400px] overflow-hidden rounded-2xl">
                      <img
                        src={image}
                        alt={`Imagen ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </AnimatedSection>

          <AnimatedSection>
            <span className="mb-4 inline-block rounded-full bg-sergen-100 px-4 py-1.5 text-sm font-medium text-sergen-800">
              Sobre Nosotros
            </span>
            <h2 className="mb-6 text-4xl font-bold text-gray-900">
              Por qué elegirnos
            </h2>
            <p className="mb-6 text-lg text-gray-600">
              SERGEN nace como respuesta a la creciente necesidad de empresas industriales de alcanzar una producción óptima con la más alta eﬁciencia energética. Ofrecemos una amplia línea de servicios especializados en la implementación de proyectos eléctricos y sistemas de control. Nos encargamos de gestionar integralmente los proyectos en todas sus etapas, asegurando el cumplimiento de los objetivos en cada fase.
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
