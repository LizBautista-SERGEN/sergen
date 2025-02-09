
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string;
  progress?: number;
}

const FormativaPage = () => {
  const navigate = useNavigate();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      
      // Fetch courses with progress
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          image_url,
          user_course_progress (
            progress
          )
        `);

      if (error) {
        console.error('Error fetching courses:', error);
        return [];
      }

      return data.map((course: any) => ({
        ...course,
        progress: course.user_course_progress?.[0]?.progress || 0
      }));
    }
  });

  const handleCourseClick = (courseId: string) => {
    // TODO: Navigate to course content page
    console.log('Navigating to course:', courseId);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <DashboardSidebar />
        <div className="flex-1 ml-[80px] hover:ml-[300px] transition-all duration-300">
          <div className="container mx-auto px-4 pt-24 pb-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-sergen-500">Programa Formativo</h1>
              <div className="flex gap-4">
                <select className="px-4 py-2 border rounded-lg">
                  <option>Categoría: Todas</option>
                </select>
                <select className="px-4 py-2 border rounded-lg">
                  <option>Autor: Todos</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                // Loading skeleton
                [...Array(3)].map((_, idx) => (
                  <Card key={idx} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  </Card>
                ))
              ) : courses?.map((course, idx) => (
                <Card 
                  key={course.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={course.image_url || '/placeholder.svg'} 
                      alt={course.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 text-sergen-700">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                    <div className="space-y-2">
                      <Progress 
                        value={course.progress} 
                        className="h-2 bg-sergen-100"
                        indicatorClassName="bg-sergen-500"
                      />
                      <div className="flex justify-between text-sm text-sergen-600">
                        <span>{course.progress}% COMPLETADO</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default FormativaPage;
