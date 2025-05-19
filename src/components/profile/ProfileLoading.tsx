
import { Loader2 } from "lucide-react";

export const ProfileLoading = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 pt-8">
      <div className="container mx-auto px-4 py-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando información del perfil...</p>
        </div>
      </div>
    </div>
  );
};
