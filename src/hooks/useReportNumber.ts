
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useReportNumber = (selectedDate: Date) => {
  const [reportNumber, setReportNumber] = useState<number | null>(null);

  useEffect(() => {
    fetchReportNumber();
  }, [selectedDate]);

  const fetchReportNumber = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;

    const { data: existingReport, error: fetchError } = await supabase
      .from('report_numbers')
      .select('report_number')
      .eq('user_id', session.user.id)
      .eq('year', year)
      .eq('month', month)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      toast.error("Error al obtener el número de informe");
      return;
    }

    if (existingReport) {
      setReportNumber(existingReport.report_number);
      return;
    }

    const { data: lastReport } = await supabase
      .from('report_numbers')
      .select('report_number')
      .eq('user_id', session.user.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1)
      .maybeSingle();

    const newReportNumber = (lastReport?.report_number || 0) + 1;

    const { error: insertError } = await supabase
      .from('report_numbers')
      .insert({
        user_id: session.user.id,
        year,
        month,
        report_number: newReportNumber
      });

    if (insertError) {
      toast.error("Error al generar el número de informe");
      return;
    }

    setReportNumber(newReportNumber);
  };

  return reportNumber;
};
