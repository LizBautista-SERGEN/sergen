
import { format, startOfMonth, endOfMonth } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { ModulationDay } from "../types/modulationTypes";
import { toast } from "sonner";

export const fetchModulationData = async (month: Date): Promise<ModulationDay[]> => {
  try {
    const start = startOfMonth(month).toISOString().split('T')[0];
    const end = endOfMonth(month).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('modulation_days')
      .select('date, is_modulated')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error al cargar datos de modulación:', error);
      toast.error("Error al cargar datos de modulación");
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error en fetchModulationData:', error);
    toast.error('Error al cargar los datos de modulación');
    return [];
  }
};

export const toggleModulation = async (
  dateStr: string,
  currentValue: boolean
): Promise<boolean> => {
  try {
    // Check if the record exists
    const { data: existingRecords, error: checkError } = await supabase
      .from('modulation_days')
      .select('id')
      .eq('date', dateStr);
      
    if (checkError) {
      console.error('Error checking existing modulation:', checkError);
      toast.error('Error al verificar modulación existente');
      return false;
    }
    
    let error;
    
    if (existingRecords && existingRecords.length > 0) {
      // Get the first record's id (in case there are duplicates)
      const recordId = existingRecords[0].id;
      
      // Update existing record
      const { error: updateError } = await supabase
        .from('modulation_days')
        .update({ is_modulated: !currentValue })
        .eq('id', recordId);
        
      error = updateError;
      
      // If there are multiple records with the same date, remove the duplicates
      if (existingRecords.length > 1) {
        // Get all ids except the first one (which we just updated)
        const duplicateIds = existingRecords.slice(1).map(record => record.id);
        
        // Delete the duplicates
        await supabase
          .from('modulation_days')
          .delete()
          .in('id', duplicateIds);
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('modulation_days')
        .insert([{
          date: dateStr,
          is_modulated: !currentValue
        }]);
        
      error = insertError;
    }

    if (error) {
      console.error('Error al actualizar modulación:', error);
      toast.error('Error al actualizar la modulación: ' + error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error en toggleModulation:', error);
    toast.error('Error al actualizar la modulación');
    return false;
  }
};
