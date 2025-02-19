
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface ConsoleOutputProps {
  error: any | null;
}

export const ConsoleOutput = ({ error }: ConsoleOutputProps) => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (error) {
      // Parsear el body si es un string JSON
      let errorDetails;
      try {
        if (typeof error.body === 'string') {
          errorDetails = JSON.parse(error.body);
        } else {
          errorDetails = error.body;
        }
      } catch (e) {
        errorDetails = { error: error.message || 'Error desconocido' };
      }

      // Construir logs detallados
      const newLogs = [
        `⚠️ Error Type: ${error.error_type || 'Unknown'}`,
        `🔍 Status: ${error.status}`,
        `❌ Error: ${errorDetails.error || error.message}`,
        `📝 Details: ${errorDetails.details || 'No additional details'}`,
        `🔗 URL: ${error.url}`,
      ];

      if (errorDetails.stack) {
        newLogs.push('🔍 Stack Trace:');
        newLogs.push(...errorDetails.stack.split('\n').map((line: string) => `   ${line.trim()}`));
      }

      setLogs(newLogs);
    } else {
      setLogs([]);
    }
  }, [error]);

  if (!error) return null;

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error en la actualización de datos</AlertTitle>
        <AlertDescription>
          Se ha producido un error al intentar obtener los datos históricos.
        </AlertDescription>
      </Alert>

      <div className="bg-gray-900 rounded-lg p-4">
        <ScrollArea className="h-[300px] w-full">
          <pre className="text-white font-mono text-sm">
            {logs.map((log, index) => (
              <div key={index} className="py-1">
                {log}
              </div>
            ))}
          </pre>
        </ScrollArea>
      </div>
    </div>
  );
};
