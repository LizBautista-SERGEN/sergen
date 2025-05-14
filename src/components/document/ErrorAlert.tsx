
import { Button } from "@/components/ui/button";

interface ErrorAlertProps {
  message: string | null;
  onRetry: () => void;
}

export const ErrorAlert = ({ message, onRetry }: ErrorAlertProps) => {
  if (!message) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-4">
      <p className="font-semibold">Error al cargar documentos:</p>
      <p className="text-sm mt-1">{message}</p>
      <Button 
        onClick={onRetry} 
        variant="outline" 
        size="sm"
        className="mt-2"
      >
        Reintentar
      </Button>
    </div>
  );
};
