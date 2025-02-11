
import { motion } from "framer-motion";
import { Leaf, CloudOff } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const Sustainability = () => {
  const metrics = [
    {
      icon: <Leaf className="h-8 w-8 text-green-500" />,
      title: "Reducción de Consumo",
      value: "-45%",
      description: "promedio en consumo energético"
    },
    {
      icon: <CloudOff className="h-8 w-8 text-blue-500" />,
      title: "Reducción CO2",
      value: "-30%",
      description: "en emisiones de carbono"
    }
  ];

  return (
    <section className="bg-gray-50 py-24">
      <div className="container mx-auto px-4">
        <AnimatedSection className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-sergen-100 px-4 py-1.5 text-sm font-medium text-sergen-800">
            Impacto Positivo
          </span>
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Compromiso Sostenible
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Impulsamos la transformación hacia un futuro más sostenible con resultados medibles
          </p>
        </AnimatedSection>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {metrics.map((metric, index) => (
            <AnimatedSection key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 * (index + 1) }}
                className="bg-white rounded-lg p-8 shadow-lg"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="rounded-lg bg-sergen-100 p-3 text-sergen-700">
                    {metric.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {metric.title}
                  </h3>
                </div>
                <p className="text-4xl font-bold text-sergen-500 mb-2">
                  {metric.value}
                </p>
                <p className="text-gray-600">
                  {metric.description}
                </p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sustainability;
