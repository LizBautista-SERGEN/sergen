
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Course, ExplanationVideo } from "@/types/course";

export const useCourseData = (courseId: string | undefined) => {
  return useQuery<Course>({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Verificar acceso al curso
      const { data: accessData } = await supabase
        .from('course_access')
        .select()
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (!accessData) {
        throw new Error('No tienes acceso a este curso');
      }

      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          course_units (
            id,
            title,
            order_index,
            lessons (
              id,
              title,
              type,
              duration,
              video_url,
              order_index,
              user_lesson_progress!inner (
                completed
              )
            )
          )
        `)
        .eq('id', courseId)
        .single();

      if (courseError) {
        console.error('Error fetching course:', courseError);
        throw courseError;
      }

      // Transform the data to match our Course interface
      const transformedCourse: Course = {
        id: courseData.id,
        title: courseData.title,
        description: courseData.description,
        video_url: courseData.video_url,
        explanation_videos: (courseData.explanation_videos || []) as ExplanationVideo[],
        course_units: courseData.course_units
          ?.sort((a: any, b: any) => a.order_index - b.order_index)
          .map((unit: any) => ({
            id: unit.id,
            title: unit.title,
            order_index: unit.order_index,
            lessons: unit.lessons
              ?.sort((a: any, b: any) => a.order_index - b.order_index)
              .map((lesson: any) => ({
                id: lesson.id,
                title: lesson.title,
                type: lesson.type,
                duration: lesson.duration,
                video_url: lesson.video_url,
                order_index: lesson.order_index,
                completed: lesson.user_lesson_progress?.[0]?.completed || false
              })) || []
          })) || []
      };

      return transformedCourse;
    }
  });
};
