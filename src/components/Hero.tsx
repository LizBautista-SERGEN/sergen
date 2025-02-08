
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const Hero = () => {
  const scrollToServices = () => {
    const servicesSection = document.getElementById("services");
    servicesSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen pt-16 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/lovable-uploads/energy-efficiency.jpg')",
          filter: "brightness(0.3)"
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      <div className="container relative z-10 mx-auto flex min-h-screen flex-col items-center justify-center px-4 text-center">
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
            Optimizamos tu consumo energético
          </h1>
          <p className="mb-8 text-xl text-gray-200">
            Transformamos la gestión energética de tu empresa con soluciones
            innovadoras y sostenibles
          </p>
        </motion.div>
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
