
import { useParams } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { CourseHeader } from "@/components/course/CourseHeader";
import { CourseProgress } from "@/components/course/CourseProgress";
import { LessonList } from "@/components/course/LessonList";
import { ExplanationVideos } from "@/components/course/ExplanationVideos";
import { useCourseData } from "@/hooks/useCourseData";
import { useLessonCompletion } from "@/hooks/useLessonCompletion";
import { calculateCourseProgress } from "@/utils/courseProgress";
import { useQueryClient } from "@tanstack/react-query";

const CoursePage = () => {
  const { courseId } = useParams();
  const queryClient = useQueryClient();
  const { data: course, isLoading } = useCourseData(courseId);
  const toggleLessonCompletion = useLessonCompletion(courseId);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center">Curso no encontrado</div>;
  }

  const handleVideoComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['course', courseId] });
  };

  const progress = calculateCourseProgress(course);

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
              <ExplanationVideos 
                videos={course.explanation_videos} 
                courseId={course.id}
                onVideoComplete={handleVideoComplete}
              />
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
