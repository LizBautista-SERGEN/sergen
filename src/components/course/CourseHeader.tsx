
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CourseHeaderProps {
  title: string;
  description: string;
}

export const CourseHeader = ({ title, description }: CourseHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center gap-2"
        onClick={() => navigate('/formativa')}
      >
        <ChevronLeft className="h-4 w-4" /> Volver
      </Button>

      <h1 className="text-3xl font-bold text-sergen-700 mb-4">{title}</h1>
      <p className="text-gray-600 mb-4">{description}</p>
    </div>
  );
};
