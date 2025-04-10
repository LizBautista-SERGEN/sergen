
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ModulationDay {
  date: string;
  is_modulated: boolean;
}

interface ModulationTableProps {
  selectedMonth: Date;
  modulationData: ModulationDay[];
  isLoading: boolean;
  isDateInFuture: (date: Date) => boolean;
  onToggleModulation: (date: Date, currentValue: boolean) => void;
}

export const ModulationTable = ({
  selectedMonth,
  modulationData,
  isLoading,
  isDateInFuture,
  onToggleModulation
}: ModulationTableProps) => {
  return (
    <div className="overflow-x-auto bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Tabla de Modulación - {format(selectedMonth, 'MMMM yyyy', { locale: es })}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                Cargando datos...
              </TableCell>
            </TableRow>
          ) : modulationData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                No hay datos disponibles para este mes
              </TableCell>
            </TableRow>
          ) : (
            modulationData
              .filter(day => !isDateInFuture(new Date(day.date)))
              .map((day) => (
                <TableRow key={day.date} className={day.is_modulated ? "bg-red-50" : "bg-green-50"}>
                  <TableCell>{format(new Date(day.date), 'dd/MM/yyyy', { locale: es })}</TableCell>
                  <TableCell>
                    <span className={day.is_modulated ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                      {day.is_modulated ? "Modulado" : "No Modulado"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const date = new Date(day.date);
                        onToggleModulation(date, day.is_modulated);
                      }}
                    >
                      Cambiar a {day.is_modulated ? "No Modulado" : "Modulado"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
