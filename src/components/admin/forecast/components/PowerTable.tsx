
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/useUserProfile";

interface PowerTableProps {
  data: any[];
  onDataChange: () => void;
}

export const PowerTable = ({ data, onDataChange }: PowerTableProps) => {
  const { isSuperUser } = useUserProfile();

  const handleModulationChange = async (id: string, isModulated: boolean) => {
    try {
      const { error } = await supabase
        .from('power_peaks')
        .update({ is_modulated: isModulated })
        .eq('id', id);

      if (error) throw error;
      toast.success('Estado de modulación actualizado');
      onDataChange();
    } catch (error) {
      console.error('Error updating modulation status:', error);
      toast.error('Error al actualizar el estado de modulación');
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getUTCDate().toString().padStart(2, '0')}/${(d.getUTCMonth() + 1).toString().padStart(2, '0')}/${d.getUTCFullYear()}`;
  };

  const formatTime = (time: string) => time;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Hora</TableHead>
          <TableHead>Potencia (MW)</TableHead>
          {isSuperUser && <TableHead>Modulado</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{formatDate(row.date)}</TableCell>
            <TableCell>{formatTime(row.peak_time)}</TableCell>
            <TableCell>{row.peak_value.toLocaleString()}</TableCell>
            {isSuperUser && (
              <TableCell>
                <Switch
                  checked={row.is_modulated}
                  onCheckedChange={(checked) => handleModulationChange(row.id, checked)}
                />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
