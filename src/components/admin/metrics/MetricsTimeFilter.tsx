
import { CalendarRange } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MetricsTimeFilterProps {
  period: "week" | "month" | "year";
  setPeriod: (value: "week" | "month" | "year") => void;
  year: string;
  setYear: (value: string) => void;
  month: string;
  setMonth: (value: string) => void;
  week: string;
  setWeek: (value: string) => void;
  years: string[];
  months: string[];
  weeks: string[];
}

export const MetricsTimeFilter = ({
  period,
  setPeriod,
  year,
  setYear,
  month,
  setMonth,
  week,
  setWeek,
  years,
  months,
  weeks,
}: MetricsTimeFilterProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
      <div className="flex items-center gap-2">
        <CalendarRange size={18} className="text-muted-foreground" />
        <span className="text-sm font-medium">Periodo:</span>
        <Select value={period} onValueChange={(value: "week" | "month" | "year") => setPeriod(value)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Seleccione periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Semana</SelectItem>
            <SelectItem value="month">Mes</SelectItem>
            <SelectItem value="year">Año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        {period === "year" && (
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {(period === "month" || period === "week") && (
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {(period === "month" || period === "week") && (
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m} value={m}>{
                  new Date(2000, parseInt(m) - 1, 1).toLocaleDateString('es', { month: 'long' })
                }</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {period === "week" && (
          <Select value={week} onValueChange={setWeek}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Semana" />
            </SelectTrigger>
            <SelectContent>
              {weeks.map(w => (
                <SelectItem key={w} value={w}>Semana {w}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};
