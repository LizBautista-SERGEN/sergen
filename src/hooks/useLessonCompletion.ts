
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useLessonCompletion = (courseId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, completed }: { lessonId: string, completed: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      toast({
        title: "Progreso actualizado",
        description: "Tu progreso ha sido actualizado correctamente.",
      });
    },
    onError: (error) => {
      console.error('Error updating lesson progress:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el progreso. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    }
  });
};
