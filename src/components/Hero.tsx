
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
    <section className="relative pt-16 bg-black">
      <div className="container relative z-10 mx-auto flex flex-col items-center justify-center px-4 min-h-[600px]">
        <Card className="w-full bg-black/[0.96] relative border-black">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="#FFFFFF"
            size={250}
          />
          
          <div className="flex flex-col md:flex-row h-full w-full">
            {/* Left content */}
            <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl"
              >
                <span className="mb-4 inline-block rounded-full bg-sergen-500/20 px-4 py-1.5 text-sm font-medium text-sergen-300">
                  Soluciones en Eficiencia Energética
                </span>
                <h1 className="mb-6 text-5xl font-bold tracking-tight text-[#F1F1F1] sm:text-6xl">
                  Tecnología que revoluciona el consumo energético
                </h1>
                <p className="mb-8 text-2xl font-semibold text-sergen-300">
                  Transformamos la gestión energética de tu empresa
                </p>
              </motion.div>
            </div>

            {/* Right content */}
            <div className="flex-1 relative min-h-[400px]">
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
          className="absolute bottom-8 animate-float cursor-pointer bg-sergen-500/20 p-2 shadow-lg transition-transform hover:scale-110"
        >
          <ChevronDown className="h-6 w-6 text-sergen-300" />
        </motion.button>
      </div>
    </section>
  );
};

export default Hero;
