
import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";

const Sustainability = () => {
  const metrics = [
    {
      icon: "/lovable-uploads/b177c3a1-c303-4222-85f8-b4055ae1640b.png",
      title: "Reducción de Consumo",
      value: "-25%",
      description: "promedio en consumo energético"
    },
    {
      icon: "/lovable-uploads/e72dcdde-147d-4e0c-9f92-27bea46ae71b.png",
      title: "Reducción CO2",
      value: "80 tn",
      description: "promedio anual por usuario"
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
                <div className="flex flex-col items-center gap-4 mb-4">
                  <div className="w-40 h-40 flex items-center justify-center">
                    <img 
                      src={metric.icon} 
                      alt={metric.title}
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {metric.title}
                  </h3>
                </div>
                <p className="text-4xl font-bold text-sergen-500 mb-2 text-center">
                  {metric.value}
                </p>
                <p className="text-gray-600 text-center">
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
