
import { FC, ChangeEvent, useState } from "react";
import { Card } from "@/components/ui/card";
import { Upload, Loader2 } from "lucide-react";

interface ReportUploadCardProps {
  uploading: boolean;
  onFileUpload: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export const ReportUploadCard: FC<ReportUploadCardProps> = ({ uploading, onFileUpload }) => {
  return (
    <Card className="p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Subir Nuevo Reporte</h2>
        <div>
          <input
            type="file"
            id="report-upload"
            className="hidden"
            accept=".pdf"
            onChange={onFileUpload}
          />
          <label
            htmlFor="report-upload"
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center block cursor-pointer hover:border-gray-400"
          >
            {uploading ? (
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
            ) : (
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            )}
            <p className="text-gray-600">Arrastra o dale clic para subir un reporte (PDF)</p>
          </label>
        </div>
      </div>
    </Card>
  );
};
