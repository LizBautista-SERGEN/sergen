
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
            <p className="text-2xl font-bold text-white bg-[#C00000] border border-gray-200 rounded px-4 h-[42px] flex items-center justify-center">7390.37</p>
          </div>
          <div className="text-center w-[200px]">
            <p className="text-sm text-gray-500">Rango horario</p>
            <p className="bg-blue-900 text-white px-4 h-[42px] rounded w-full flex items-center justify-center">Sin modulación</p>
          </div>
          <div className="text-center w-[200px]">
            <p className="text-sm text-gray-500">Riesgo de coincidente</p>
            <p className="bg-blue-900 text-white px-4 h-[42px] rounded w-full flex items-center justify-center">BAJO</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
