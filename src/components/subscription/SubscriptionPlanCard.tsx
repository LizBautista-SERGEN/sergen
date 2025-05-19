
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

interface PlanType {
  id: string;
  name: string;
  price: number;
  features: string[];
  recommendedFor: string;
}

interface SubscriptionPlanCardProps {
  plan: PlanType;
  onSelect: () => void;
}

export const SubscriptionPlanCard = ({ plan, onSelect }: SubscriptionPlanCardProps) => {
  return (
    <Card className="flex flex-col h-full border-2 hover:border-sergen-500 transition-colors">
      <CardHeader className="bg-sergen-50/50">
        <CardTitle className="text-xl font-bold text-center">{plan.name}</CardTitle>
        <div className="mt-4 text-center">
          <div className="text-3xl font-bold text-sergen-600">
            ${plan.price}
            <span className="text-lg font-normal text-gray-500">/mes</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-6">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2 mt-1 text-sergen-500">
                <Check size={16} />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="mt-6 p-3 bg-gray-50 rounded-md">
          <h4 className="font-medium mb-1">Recomendado para:</h4>
          <p className="text-sm text-gray-600">{plan.recommendedFor}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onSelect}
          className="w-full bg-sergen-500 hover:bg-sergen-600"
        >
          Adquirir
        </Button>
      </CardFooter>
    </Card>
  );
};
