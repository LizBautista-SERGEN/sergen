
import { useModulationData } from "./modulation/useModulationData";
import { MonthSelector } from "./modulation/MonthSelector";
import { DateSelector } from "./modulation/DateSelector";
import { SelectedDayModulation } from "./modulation/SelectedDayModulation";
import { ModulationCalendar } from "./modulation/ModulationCalendar";
import { ModulationLegend } from "./modulation/ModulationLegend";
import { ModulationTable } from "./modulation/ModulationTable";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const ModulationTab = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const {
    selectedDate,
    selectedMonth,
    modulationData,
    isLoading,
    selectedDayData,
    startDate,
    handleToggleModulation,
    handleMonthChange,
    getDateClassName,
    isDateInFuture,
    handleDateSelect,
    setSelectedMonth
  } = useModulationData();

  if (!isAuthenticated) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acceso denegado</AlertTitle>
        <AlertDescription>
          Debe iniciar sesión para acceder a la funcionalidad de modulación.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <MonthSelector 
        selectedMonth={selectedMonth} 
        onMonthChange={handleMonthChange} 
      />

      <div className="flex justify-between gap-6">
        <div className="w-1/2">
          <DateSelector 
            selectedDate={selectedDate}
            selectedMonth={selectedMonth}
            startDate={startDate}
            onDateSelect={handleDateSelect}
            onMonthChange={setSelectedMonth}
            isDateInFuture={isDateInFuture}
            getDateClassName={getDateClassName}
          />

          <SelectedDayModulation 
            selectedDate={selectedDate}
            selectedDayData={selectedDayData}
            isDateInFuture={isDateInFuture}
            onToggleModulation={handleToggleModulation}
          />
        </div>

        <div className="w-1/2">
          <ModulationCalendar 
            selectedDate={selectedDate}
            selectedMonth={selectedMonth}
            startDate={startDate}
            onDateSelect={handleDateSelect}
            onMonthChange={setSelectedMonth}
            isDateInFuture={isDateInFuture}
            getDateClassName={getDateClassName}
          />

          <ModulationLegend />
        </div>
      </div>

      <ModulationTable 
        selectedMonth={selectedMonth}
        modulationData={modulationData}
        isLoading={isLoading}
        isDateInFuture={isDateInFuture}
        onToggleModulation={handleToggleModulation}
      />
    </div>
  );
};
