
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

const courses = [
  {
    title: "Gobernanza de Datos",
    image: "/lovable-uploads/c9da053f-d6d7-4371-bc94-66f8f73b3933.png",
    progress: 100,
    author: "IALAB UBA"
  },
  {
    title: "Gobernanza de la Inteligencia Artificial",
    image: "/lovable-uploads/7fdffa96-4899-4c3f-a71a-57ba2e367fbd.png",
    progress: 100,
    author: "IALAB UBA"
  },
  {
    title: "Diseño y Despliegue de IA",
    image: "/lovable-uploads/ea9befc3-900a-4e50-b495-f97ddfcc7cb4.png",
    progress: 100,
    author: "IALAB UBA"
  }
];

const FormativaPage = () => {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <DashboardSidebar />
        <div className="flex-1 ml-[80px] hover:ml-[300px] transition-all duration-300">
          <div className="container mx-auto px-4 pt-24 pb-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Cursos Disponibles</h1>
              <div className="flex gap-4">
                <select className="px-4 py-2 border rounded-lg">
                  <option>Category: All</option>
                </select>
                <select className="px-4 py-2 border rounded-lg">
                  <option>Author: All</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, idx) => (
                <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      <span className="text-sm text-gray-600">{course.author}</span>
                    </div>
                    <div className="space-y-2">
                      <Progress value={course.progress} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span>{course.progress}% COMPLETE</span>
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
