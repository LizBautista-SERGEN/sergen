
import { useModulationData } from "./modulation/useModulationData";
import { MonthSelector } from "./modulation/MonthSelector";
import { DateSelector } from "./modulation/DateSelector";
import { SelectedDayModulation } from "./modulation/SelectedDayModulation";
import { ModulationCalendar } from "./modulation/ModulationCalendar";
import { ModulationLegend } from "./modulation/ModulationLegend";
import { ModulationTable } from "./modulation/ModulationTable";

export const ModulationTab = () => {
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
