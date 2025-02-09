
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";

const ServiceContractual = () => {
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
                <FileSpreadsheet className="h-8 w-8 text-sergen-700" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-6">Gestión Contractual</h1>
            <p className="text-lg text-gray-600 mb-8">
              Analizamos y optimizamos tus contratos energéticos para maximizar el ahorro.
            </p>
            <Button 
              onClick={() => navigate("/contacto")}
              className="bg-sergen-500 text-white hover:bg-sergen-600"
            >
              Solicitar Consulta
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default ServiceContractual;
