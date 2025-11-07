
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SplineScene } from "./ui/splite";
import { Card } from "./ui/card";
import { Spotlight } from "./ui/spotlight";

const Hero = () => {
  const scrollToServices = () => {
    const servicesSection = document.getElementById("services");
    servicesSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-16 bg-black min-h-screen flex items-center">
      <div className="container relative z-10 mx-auto px-4 py-8">
        <Card className="w-full bg-black/[0.96] relative border-black overflow-hidden">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="#FFFFFF"
            size={250}
          />
          
          <div className="flex flex-col lg:flex-row h-full w-full">
            {/* Left content */}
            <div className="lg:w-5/12 p-6 md:p-12 relative z-10 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl"
              >
                <span className="mb-4 inline-block rounded-full bg-sergen-500/20 px-4 py-1.5 text-sm md:text-base font-medium text-sergen-300">
                  Soluciones en Eficiencia Energética
                </span>
                <h1 className="mb-6 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-[#F1F1F1]">
                  Tecnología que revoluciona el consumo energético
                </h1>
                <p className="mb-8 text-lg md:text-xl lg:text-2xl font-semibold text-sergen-300">
                  Transformamos la gestión energética de tu empresa
                </p>
              </motion.div>
            </div>

            {/* Right content - Robot prominente */}
            <div className="lg:w-7/12 relative h-[500px] md:h-[600px] lg:h-[700px]">
              <SplineScene 
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            </div>
          </div>
        </Card>
        
        <motion.button
          onClick={scrollToServices}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float cursor-pointer bg-sergen-500/20 p-2 rounded-full shadow-lg transition-transform hover:scale-110"
        >
          <ChevronDown className="h-6 w-6 text-sergen-300" />
        </motion.button>
      </div>
    </section>
  );
};

export default Hero;
