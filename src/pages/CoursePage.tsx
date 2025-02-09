
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Play, FileText, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

const CoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
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
        .order('order_index', { foreignTable: 'course_units.lessons' })
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
            <Button 
              variant="ghost" 
              className="mb-4 flex items-center gap-2"
              onClick={() => navigate('/formativa')}
            >
              <ChevronLeft className="h-4 w-4" /> Volver
            </Button>

            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-sergen-700 mb-4">{course.title}</h1>
                <p className="text-gray-600 mb-4">{course.description}</p>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-700">Progreso del curso</h3>
                    <span className="text-sm font-medium text-sergen-600">
                      {Math.round(progress)}% Completado
                    </span>
                  </div>
                  <Progress value={progress} className="h-2 bg-sergen-100" />
                </div>
              </div>

              <div className="space-y-8">
                {course.course_units?.map((unit, index) => (
                  <Card key={unit.id} className="p-6">
                    <h2 className="text-xl font-semibold mb-4 text-sergen-600">
                      Unidad {index + 1}: {unit.title}
                    </h2>
                    <div className="space-y-3">
                      {unit.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                          onClick={() => handleLessonClick(lesson)}
                        >
                          {lesson.completed ? (
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="h-4 w-4 text-green-600" />
                            </div>
                          ) : lesson.type === 'video' ? (
                            <Play className="h-5 w-5 text-sergen-500" />
                          ) : (
                            <FileText className="h-5 w-5 text-sergen-500" />
                          )}
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900">
                              {lesson.title}
                            </h3>
                            {lesson.duration && (
                              <p className="text-xs text-gray-500">
                                {lesson.duration}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CoursePage;
