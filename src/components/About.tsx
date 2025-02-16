
import AnimatedSection from "./AnimatedSection";
import { FileText, DollarSign } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const About = () => {
  const images = [
    "/lovable-uploads/60f7a1f0-0d44-4fc7-8c8e-2ec98c50c7d6.png",
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
            <span className="mb-4 inline-block rounded-full bg-sergen-100 px-4 py-1.5 text-sm font-medium text-sergen-800">
              Sobre Nosotros
            </span>
            <h2 className="mb-6 text-4xl font-bold text-gray-900">
              Expertos en eficiencia energética
            </h2>
            <p className="mb-6 text-lg text-gray-600">
              En SERGEN, nos especializamos en ayudar a empresas industriales a optimizar su producción con la máxima eficiencia energética. Como expertos en soluciones energéticas para el sector industrial, ofrecemos soluciones integrales que combinan innovación, sostenibilidad y rentabilidad. Nuestro compromiso es impulsar la productividad de tu negocio mientras reducimos el impacto ambiental.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-6 w-6 text-sergen-600" />
                  <h4 className="text-2xl font-bold text-sergen-600">+40</h4>
                </div>
                <p className="text-gray-600">Proyectos Completados: Soluciones personalizadas para cada cliente.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-6 w-6 text-sergen-600" />
                  <h4 className="text-2xl font-bold text-sergen-600">37%</h4>
                </div>
                <p className="text-gray-600">Ahorro Promedio: Reducción comprobada en costos energéticos.</p>
              </div>
            </div>
          </AnimatedSection>

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
        </div>
      </div>
    </section>
  );
};

export default About;
