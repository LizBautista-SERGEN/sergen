
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const CoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) {
        console.error('Error fetching course:', error);
        return null;
      }

      return data;
    }
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center">Curso no encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-4 flex items-center gap-2"
          onClick={() => navigate('/formativa')}
        >
          <ChevronLeft className="h-4 w-4" /> Volver
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-sergen-700 mb-6">{course.title}</h1>
          
          {course.video_url ? (
            <div className="aspect-video w-full mb-6">
              <iframe
                src={course.video_url}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video w-full bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
              <p className="text-gray-500">No hay video disponible</p>
            </div>
          )}

          <div className="prose max-w-none">
            <p className="text-gray-600">{course.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
