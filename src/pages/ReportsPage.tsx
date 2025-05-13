
import { useReports } from "@/hooks/useReports";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportUploadCard } from "@/components/reports/ReportUploadCard";
import { ReportsList } from "@/components/reports/ReportsList";
import { useUserProfile } from "@/hooks/useUserProfile";

const ReportsPage = () => {
  const { profile } = useUserProfile();
  const { 
    reports, 
    isLoading, 
    uploading, 
    deletingId, 
    handleFileUpload, 
    handleDelete 
  } = useReports();

  return (
    <div className="container mx-auto px-4 py-8">
      <ReportsHeader title="Reportes" />
      
      <ReportUploadCard 
        uploading={uploading} 
        onFileUpload={handleFileUpload} 
      />

      <ReportsList 
        reports={reports} 
        isLoading={isLoading} 
        deletingId={deletingId} 
        onDelete={handleDelete} 
      />
    </div>
  );
};

export default ReportsPage;
