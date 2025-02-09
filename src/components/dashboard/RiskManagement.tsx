
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const RiskManagement = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-center">Gestión de riesgo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-2 flex flex-col items-center">
          <div className="text-center w-[200px]">
            <p className="text-sm text-gray-500">Potencia Máxima</p>
            <p className="text-2xl font-bold text-blue-900 bg-white border border-gray-200 rounded px-4 py-2">7390.37</p>
          </div>
          <div className="text-center w-[200px]">
            <p className="text-sm text-gray-500">Rango horario</p>
            <p className="bg-blue-900 text-white px-4 py-2 rounded w-full">Sin modulación</p>
          </div>
          <div className="text-center w-[200px]">
            <p className="text-sm text-gray-500">Riesgo de coincidente</p>
            <p className="bg-blue-900 text-white px-4 py-2 rounded w-full">BAJO</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
