
import { useState } from "react";
import { useReports } from "@/hooks/useReports";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportUploadCard } from "@/components/reports/ReportUploadCard";
import { ReportsList } from "@/components/reports/ReportsList";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ReportDateSelector } from "@/components/reports/ReportDateSelector";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";

const ReportsPage = () => {
  const { profile } = useUserProfile();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  
  const { 
    reports, 
    isLoading, 
    uploading, 
    deletingId, 
    error,
    handleFileUpload, 
    handleDelete,
    fetchReports
  } = useReports();

  // Handle month change in filter
  const handleMonthChange = (month: string) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(parseInt(month));
    setSelectedDate(newDate);
    filterReports(newDate);
  };

  // Handle year change in filter
  const handleYearChange = (year: string) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(parseInt(year));
    setSelectedDate(newDate);
    filterReports(newDate);
  };

  // Filter reports by date
  const filterReports = (date: Date) => {
    if (!reports || reports.length === 0) {
      setFilteredReports([]);
      return;
    }

    // Extract month and year from the selected date
    const selectedMonth = date.getMonth();
    const selectedYear = date.getFullYear();

    // Filter reports based on their creation date (or any date field you have)
    const filtered = reports.filter(report => {
      // Assuming report has a created_at field or similar
      if (!report.created_at) return true; // Include if no date info

      const reportDate = new Date(report.created_at);
      return reportDate.getMonth() === selectedMonth && 
             reportDate.getFullYear() === selectedYear;
    });

    setFilteredReports(filtered);
  };

  // Initial filter when reports load
  useState(() => {
    if (reports && reports.length > 0) {
      filterReports(selectedDate);
    } else {
      setFilteredReports([]);
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <ReportsHeader title="Reportes" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ReportDateSelector 
            selectedDate={selectedDate}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
          />

          <ReportUploadCard 
            uploading={uploading} 
            onFileUpload={handleFileUpload} 
            className="mt-4"
          />
        </div>

        <div className="lg:col-span-3">
          <h2 className="text-xl font-semibold mb-4">
            Reportes - {format(selectedDate, "MMMM yyyy", { locale: es })}
          </h2>
          
          <ReportsList 
            reports={filteredReports.length > 0 ? filteredReports : reports}
            isLoading={isLoading} 
            deletingId={deletingId}
            error={error}
            onDelete={handleDelete}
            onRetry={fetchReports}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
