
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
    <section className="relative min-h-screen overflow-hidden pt-16">
      <div className="container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center px-4">
        <Card className="w-full bg-black/[0.96] relative overflow-hidden">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="white"
          />
          
          <div className="flex flex-col md:flex-row h-full">
            {/* Left content */}
            <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl"
              >
                <motion.img
                  src="/lovable-uploads/12ae4369-c1d4-4066-b8c6-b5d4060a8d15.png"
                  alt="Sergen Logo"
                  className="mx-auto mb-8 w-64 sm:w-80"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
                <span className="mb-4 inline-block rounded-full bg-sergen-100 px-4 py-1.5 text-sm font-medium text-sergen-800">
                  Soluciones en Eficiencia Energética
                </span>
                <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl">
                  OPTIMIZAMOS TU CONSUMO ENERGÉTICO
                </h1>
                <p className="mb-8 text-2xl font-semibold bg-gradient-to-r from-sergen-700 to-sergen-500 bg-clip-text text-transparent">
                  Transformamos la gestión energética de tu empresa con soluciones
                  innovadoras y sostenibles
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
          className="absolute bottom-8 animate-float cursor-pointer rounded-full bg-white p-2 shadow-lg transition-transform hover:scale-110"
        >
          <ChevronDown className="h-6 w-6 text-sergen-500" />
        </motion.button>
      </div>
    </section>
  );
};

export default Hero;
