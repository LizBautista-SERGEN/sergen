
import { Button } from "@/components/ui/button";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { FileIcon, Trash2 } from "lucide-react";
import { WaitlistEntry } from "@/types/waitlist";

interface WaitlistTableProps {
  waitlistEntries: WaitlistEntry[];
  invoicesMap: Record<string, any[]>;
  viewInvoices: (waitlistId: string) => void;
  setSelectedEntry: (entry: WaitlistEntry) => void;
  setStatus: (status: string) => void;
  setNotes: (notes: string) => void;
  deleteEntry?: (entryId: string) => void;
}

export const WaitlistTable = ({
  waitlistEntries,
  invoicesMap,
  viewInvoices,
  setSelectedEntry,
  setStatus,
  setNotes,
  deleteEntry
}: WaitlistTableProps) => {
  const getPlanName = (planType: string) => {
    return planType === "basic" ? "Plan Básico" : "Plan Avanzado";
  };

  return (
    <TableBody>
      {waitlistEntries.length === 0 ? (
        <TableRow>
          <TableCell colSpan={10} className="text-center py-6">
            No hay registros en la lista de espera
          </TableCell>
        </TableRow>
      ) : (
        waitlistEntries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="font-medium">{entry.full_name}</TableCell>
            <TableCell>{entry.company_name}</TableCell>
            <TableCell>{entry.position}</TableCell>
            <TableCell>
              <div>{entry.email}</div>
              <div className="text-gray-500">{entry.phone}</div>
            </TableCell>
            <TableCell>{getPlanName(entry.plan_type)}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                entry.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                entry.status === "contacted" ? "bg-blue-100 text-blue-800" :
                "bg-green-100 text-green-800"
              }`}>
                {entry.status === "pending" ? "Pendiente" :
                 entry.status === "contacted" ? "Contactado" : "Convertido"}
              </span>
            </TableCell>
            <TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell>
            <TableCell>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => viewInvoices(entry.id)}
              >
                <FileIcon size={16} className="mr-1" />
                {(invoicesMap[entry.id] || []).length}
              </Button>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedEntry(entry);
                    setStatus(entry.status);
                    setNotes(entry.notes || "");
                  }}
                >
                  Editar
                </Button>
                
                {deleteEntry && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteEntry(entry.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  );
};
