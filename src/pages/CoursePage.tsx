
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useToast } from "@/components/ui/use-toast";
import { CourseHeader } from "@/components/course/CourseHeader";
import { CourseProgress } from "@/components/course/CourseProgress";
import { LessonList } from "@/components/course/LessonList";

const CoursePage = () => {
  const { courseId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_units!course_units_course_id_fkey (
            id,
            title,
            order_index,
            lessons!lessons_unit_id_fkey (
              id,
              title,
              type,
              duration,
              video_url,
              order_index,
              user_lesson_progress!user_lesson_progress_lesson_id_fkey (
                completed
              )
            )
          )
        `)
        .eq('id', courseId)
        .single();

      if (error) {
        console.error('Error fetching course:', error);
        return null;
      }

      // Sort units and lessons by order_index
      const sortedCourse = {
        ...data,
        course_units: data.course_units
          ?.sort((a, b) => a.order_index - b.order_index)
          .map(unit => ({
            ...unit,
            lessons: unit.lessons
              ?.sort((a, b) => a.order_index - b.order_index)
              .map(lesson => ({
                ...lesson,
                completed: lesson.user_lesson_progress?.[0]?.completed || false
              }))
          }))
      };

      return sortedCourse;
    }
  });

  const toggleLessonCompletion = useMutation({
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

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center">Curso no encontrado</div>;
  }

  const totalLessons = course.course_units?.reduce(
    (acc, unit) => acc + unit.lessons.length,
    0
  ) || 0;

  const completedLessons = course.course_units?.reduce(
    (acc, unit) => acc + unit.lessons.filter(lesson => lesson.completed).length,
    0
  ) || 0;

  const progress = totalLessons ? (completedLessons / totalLessons) * 100 : 0;

  const handleLessonClick = (lesson: any) => {
    toggleLessonCompletion.mutate({
      lessonId: lesson.id,
      completed: !lesson.completed
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <DashboardSidebar />
        <div className="flex-1 ml-[80px] hover:ml-[300px] transition-all duration-300">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <CourseHeader title={course.title} description={course.description} />
              <CourseProgress progress={progress} />
              <div className="mt-8">
                <LessonList 
                  units={course.course_units} 
                  onLessonClick={handleLessonClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CoursePage;
