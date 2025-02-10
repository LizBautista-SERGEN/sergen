
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import About from "@/components/About";
import Contact from "@/components/Contact";
import { Feature } from "@/components/ui/feature-with-image-comparison";

const Index = () => {
  return (
    <main className="overflow-hidden">
      <Hero />
      <div className="bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="h-[600px] bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8">
              <span className="text-sergen-500 font-semibold">Nuestra Propuesta de Valor</span>
              <h2 className="text-3xl font-bold mt-2 text-gray-900">Transformación Energética para tu Empresa</h2>
              <p className="text-gray-600 mt-4">
                Optimizamos el consumo energético de tu empresa mediante soluciones tecnológicas avanzadas y personalizadas.
              </p>
            </div>
            <Feature />
          </div>
        </div>
      </div>
      <Services />
      <About />
      <Contact />
    </main>
  );
};

export default Index;
