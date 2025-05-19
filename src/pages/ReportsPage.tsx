
import { useState, useEffect } from "react";
import { useReports } from "@/hooks/useReports";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportUploadCard } from "@/components/reports/ReportUploadCard";
import { ReportsList } from "@/components/reports/ReportsList";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ReportDateSelector } from "@/components/reports/ReportDateSelector";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ReportsPage = () => {
  const { profile } = useUserProfile();
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
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

  // Extract year and month from report filename
  const parseReportFilename = (filename: string) => {
    // Expected format: "ENERO 2025 - REPORTE"
    const parts = filename.split(' ');
    if (parts.length >= 2) {
      const month = parts[0].toUpperCase(); // e.g., "ENERO"
      const year = parts[1].replace('-', '').trim(); // e.g., "2025"
      return { month, year };
    }
    return null;
  };

  // Get list of available years from reports
  const getAvailableYears = () => {
    if (!reports || reports.length === 0) return [];
    
    const years = new Set<string>();
    reports.forEach(report => {
      const parsed = parseReportFilename(report.filename);
      if (parsed && parsed.year) {
        years.add(parsed.year);
      }
    });
    
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)); // Sort years descending
  };

  // Get list of available months for the selected year
  const updateAvailableMonths = (year: string | null) => {
    if (!year || !reports || reports.length === 0) {
      setAvailableMonths([]);
      return;
    }

    const months = new Set<string>();
    reports.forEach(report => {
      const parsed = parseReportFilename(report.filename);
      if (parsed && parsed.year === year) {
        months.add(parsed.month);
      }
    });

    setAvailableMonths(Array.from(months));
  };

  // Filter reports based on selected year and month
  const filterReports = () => {
    if (!reports || reports.length === 0) {
      setFilteredReports([]);
      return;
    }

    if (!selectedYear) {
      setFilteredReports([]);
      return;
    }

    let filtered = reports.filter(report => {
      const parsed = parseReportFilename(report.filename);
      if (!parsed) return false;

      if (selectedYear && selectedMonth) {
        return parsed.year === selectedYear && parsed.month === selectedMonth;
      } else if (selectedYear) {
        return parsed.year === selectedYear;
      }
      
      return true;
    });

    setFilteredReports(filtered);
  };

  // Handle year change
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedMonth(null); // Reset month when year changes
    updateAvailableMonths(year);
  };

  // Handle month change
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  // Add clear filters function
  const handleClearFilters = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
    setAvailableMonths([]);
  };

  // Update filtered reports when selection changes
  useEffect(() => {
    filterReports();
  }, [selectedYear, selectedMonth, reports]);

  // Update available months when reports are loaded
  useEffect(() => {
    if (selectedYear) {
      updateAvailableMonths(selectedYear);
    }
  }, [reports, selectedYear]);

  // Determine what to display
  const getDisplayTitle = () => {
    if (selectedYear && selectedMonth) {
      return `Reportes - ${selectedMonth} ${selectedYear}`;
    } else if (selectedYear) {
      return `Reportes - ${selectedYear}`;
    }
    return "Reportes";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ReportsHeader title="Reportes" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ReportDateSelector 
            availableYears={getAvailableYears()}
            availableMonths={availableMonths}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={handleYearChange}
            onMonthChange={handleMonthChange}
            onClearFilters={handleClearFilters}
          />

          <ReportUploadCard 
            uploading={uploading} 
            onFileUpload={handleFileUpload} 
            className="mt-4"
          />
        </div>

        <div className="lg:col-span-3">
          <h2 className="text-xl font-semibold mb-4">
            {getDisplayTitle()}
          </h2>
          
          <ReportsList 
            reports={selectedYear ? filteredReports : reports}
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
