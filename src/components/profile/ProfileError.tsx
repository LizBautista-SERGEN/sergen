
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ProfileErrorProps {
  error: string;
  onRetry: () => void;
}

export const ProfileError = ({ error, onRetry }: ProfileErrorProps) => {
  return (
    <div className="flex min-h-screen bg-gray-50 pt-8">
      <div className="container mx-auto px-4 py-4">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            Error al cargar el perfil: {error}. Por favor, intenta recargar la página.
          </AlertDescription>
        </Alert>
        <Button onClick={onRetry}>Reintentar</Button>
      </div>
    </div>
  );
};
