
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const ServiceDiagnostico = () => {
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
                <Search className="h-8 w-8 text-sergen-700" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-6">Diagnóstico Energético</h1>
            <p className="text-lg text-gray-600 mb-8">
              Se detecta los principales focos de consumo con el fin de identificar las áreas con mayor potencial de ahorro. 
              Además, sugiere medidas de mejora para reducir dicho consumo, evaluando tanto el ahorro esperado como la inversión requerida.
            </p>
            <Button 
              onClick={() => navigate("/contacto")}
              className="bg-sergen-500 text-white hover:bg-sergen-600"
            >
              Solicitar Diagnóstico
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default ServiceDiagnostico;
