
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gauge } from "lucide-react";

const ServiceControl = () => {
  const navigate = useNavigate();

  return (
    <main className="pt-16">
      <section className="bg-gradient-to-b from-white to-sergen-50/30 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="mb-8 flex justify-center">
              <div className="h-16 w-16 rounded-full bg-sergen-100 flex items-center justify-center">
                <Gauge className="h-8 w-8 text-sergen-700" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-6">Control de Demanda</h1>
            <p className="text-lg text-gray-600 mb-8">
              Optimizamos el consumo energético mediante monitoreo en tiempo real y ajustes automáticos.
              Implementamos sistemas de control inteligente para maximizar la eficiencia.
            </p>
            <Button 
              onClick={() => navigate("/contacto")}
              className="bg-sergen-500 text-white hover:bg-sergen-600"
            >
              Solicitar Control de Demanda
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default ServiceControl;
