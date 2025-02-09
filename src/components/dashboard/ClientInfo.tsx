
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const ClientInfo = () => {
  const navigate = useNavigate();

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-center">Información de cliente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-2 flex flex-col items-center">
          <button 
            onClick={() => navigate("/servicios/control")}
            className="bg-sergen-500 text-white px-4 py-2 rounded hover:bg-sergen-600 w-[200px]"
          >
            Control de demanda
          </button>
          <button 
            onClick={() => navigate("/servicios/efficiency")}
            className="bg-sergen-500 text-white px-4 py-2 rounded hover:bg-sergen-600 w-[200px]"
          >
            Ahorro acumulado
          </button>
          <button 
            onClick={() => navigate("/servicios/diagnostico")}
            className="bg-sergen-500 text-white px-4 py-2 rounded hover:bg-sergen-600 w-[200px]"
          >
            Desagregado de gasto
          </button>
          <button 
            className="bg-sergen-500 text-white px-4 py-2 rounded hover:bg-sergen-600 w-[200px]"
          >
            Subir factura
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
