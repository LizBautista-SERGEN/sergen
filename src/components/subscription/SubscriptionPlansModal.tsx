
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { SubscriptionPlanCard } from "./SubscriptionPlanCard";
import { WaitlistForm } from "./WaitlistForm";

// Define the plan details
const plans = [
  {
    id: "basic",
    name: "Plan Básico",
    features: [
      "Consultoría en Eficiencia Energética",
      "Análisis de requerimientos energéticos",
      "Consultoría en Generación Distribuida",
      "Control del perfil de carga eléctrico",
      "Seguimiento del consumo y proyección de energía",
      "Reportes de evolución de energía"
    ],
    recommendedFor: "Pequeñas y medianas empresas con consumos mensuales de 0-100,000 KWh."
  },
  {
    id: "advanced",
    name: "Plan Avanzado",
    features: [
      "Consultoría en Eficiencia Energética",
      "Análisis de requerimientos energéticos",
      "Control del perfil de carga eléctrico",
      "Seguimiento del consumo y proyección de energía",
      "Reportes de evolución de energía",
      "Control de la facturación de energía",
      "Análisis del contrato de suministro eléctrico",
      "Gestión del costo de la potencia en horas punta"
    ],
    recommendedFor: "Medianas y grandes empresas con consumos mensuales superiores a 100,000 KWh."
  }
];

interface SubscriptionPlansModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubscriptionPlansModal = ({ open, onOpenChange }: SubscriptionPlansModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowWaitlistForm(true);
  };

  const handleBackToPlans = () => {
    setShowWaitlistForm(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {showWaitlistForm ? `Solicitar ${selectedPlan === "basic" ? "Plan Básico" : "Plan Avanzado"}` : "Planes de Suscripción"}
          </DialogTitle>
        </DialogHeader>

        {!showWaitlistForm ? (
          <div className="space-y-6">
            <p className="text-center text-gray-600">
              Seleccione el plan que mejor se adapte a sus necesidades
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <SubscriptionPlanCard 
                  key={plan.id}
                  plan={plan}
                  onSelect={() => handlePlanSelect(plan.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            <Button 
              variant="outline" 
              className="mb-4"
              onClick={handleBackToPlans}
            >
              ← Volver a planes
            </Button>
            <WaitlistForm 
              plan={selectedPlan || "basic"} 
              onComplete={() => onOpenChange(false)} 
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
