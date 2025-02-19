
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ExportDataDialog } from "../../ExportDataDialog";
import { HistoricalChart } from "../HistoricalChart";
import { HistoricalDatePicker } from "./HistoricalDatePicker";

interface HistoricalHeaderProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onUpdateData: () => void;
  historicalData?: any[];
}

export const HistoricalHeader = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onUpdateData,
  historicalData,
}: HistoricalHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Datos Históricos</h2>
      <div className="flex gap-4">
        <HistoricalDatePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
        />

        <Button 
          onClick={onUpdateData} 
          disabled={!startDate || !endDate}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar Datos
        </Button>

        {historicalData && historicalData.length > 0 && (
          <ExportDataDialog 
            data={historicalData} 
            filename="datos-historicos" 
            chartComponent={<HistoricalChart data={historicalData} />}
          />
        )}
      </div>
    </div>
  );
};
