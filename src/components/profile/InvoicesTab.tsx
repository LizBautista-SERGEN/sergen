
import { useDocumentManagement } from "@/hooks/useDocumentManagement";
import { DocumentList } from "@/components/document/DocumentList";
import { DocumentUploader } from "@/components/document/DocumentUploader";
import { ErrorAlert } from "@/components/document/ErrorAlert";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FilterX } from "lucide-react";

// Map of Spanish month names to numbers for sorting
const monthToNumber = {
  "ENERO": 1,
  "FEBRERO": 2,
  "MARZO": 3,
  "ABRIL": 4,
  "MAYO": 5,
  "JUNIO": 6,
  "JULIO": 7,
  "AGOSTO": 8,
  "SEPTIEMBRE": 9,
  "OCTUBRE": 10,
  "NOVIEMBRE": 11,
  "DICIEMBRE": 12
};

const InvoicesTab = () => {
  const {
    documents: allInvoices,
    isLoading,
    uploading,
    deletingId,
    error,
    handleFileUpload,
    handleDelete,
    fetchDocuments,
    getBucketName
  } = useDocumentManagement('invoice');
  
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState(allInvoices);

  // Parse document name to extract month and year
  const parseDocumentName = (filename: string) => {
    const parts = filename.split('-');
    if (parts.length >= 2) {
      return {
        month: parts[0].trim().toUpperCase(),
        year: parts[1].trim()
      };
    }
    return null;
  };

  // Extract available years and months on initial load and when documents change
  useEffect(() => {
    if (!allInvoices) return;
    
    const years = new Set<string>();
    
    allInvoices.forEach(invoice => {
      const parsedInfo = parseDocumentName(invoice.filename);
      if (parsedInfo?.year) {
        years.add(parsedInfo.year);
      }
    });
    
    setAvailableYears(Array.from(years).sort((a, b) => Number(b) - Number(a)));
    setFilteredInvoices(allInvoices);
  }, [allInvoices]);

  // Update available months when selected year changes
  useEffect(() => {
    if (!allInvoices || !selectedYear) {
      setAvailableMonths([]);
      return;
    }
    
    const months = new Set<string>();
    
    allInvoices.forEach(invoice => {
      const parsedInfo = parseDocumentName(invoice.filename);
      if (parsedInfo?.year === selectedYear) {
        months.add(parsedInfo.month);
      }
    });
    
    // Sort months chronologically
    const sortedMonths = Array.from(months).sort((a, b) => {
      return (monthToNumber[a] || 999) - (monthToNumber[b] || 999);
    });
    
    setAvailableMonths(sortedMonths);
  }, [selectedYear, allInvoices]);

  // Apply filters
  useEffect(() => {
    if (!allInvoices) return;
    
    let filtered = [...allInvoices];
    
    if (selectedYear) {
      filtered = filtered.filter(invoice => {
        const parsedInfo = parseDocumentName(invoice.filename);
        return parsedInfo?.year === selectedYear;
      });
      
      if (selectedMonth) {
        filtered = filtered.filter(invoice => {
          const parsedInfo = parseDocumentName(invoice.filename);
          return parsedInfo?.month === selectedMonth;
        });
      }
    }
    
    setFilteredInvoices(filtered);
  }, [selectedYear, selectedMonth, allInvoices]);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedMonth(null);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const clearFilters = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
  };

  return (
    <div>
      <div className="grid gap-4">
        <ErrorAlert message={error} onRetry={fetchDocuments} />

        <DocumentUploader
          id="invoice-upload"
          label="Subir Nueva Factura"
          accept=".pdf, .xls, .xlsx"
          isUploading={uploading}
          onUpload={handleFileUpload}
          description="Arrastra o da clic para subir una factura (PDF, XLS, XLSX)"
        />

        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="font-medium mb-3">Filtrar facturas</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Año:</label>
                  <Select 
                    value={selectedYear || ""} 
                    onValueChange={handleYearChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mes:</label>
                  <Select 
                    value={selectedMonth || ""} 
                    onValueChange={handleMonthChange}
                    disabled={!selectedYear}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMonths.map(month => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {(selectedYear || selectedMonth) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFilters}
                    className="w-full mt-2 flex items-center justify-center gap-2"
                  >
                    <FilterX className="h-4 w-4" />
                    Quitar filtros
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <h2 className="text-xl font-semibold mb-2">Facturas Disponibles</h2>
            <DocumentList
              documents={filteredInvoices}
              bucketName={getBucketName('invoice')}
              isLoading={isLoading}
              deletingId={deletingId}
              onDelete={handleDelete}
              emptyMessage="No hay facturas disponibles"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicesTab;
