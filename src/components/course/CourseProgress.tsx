
import { Progress } from "@/components/ui/progress";

interface CourseProgressProps {
  progress: number;
}

export const CourseProgress = ({ progress }: CourseProgressProps) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-700">Progreso del curso</h3>
        <span className="text-sm font-medium text-sergen-600">
          {Math.round(progress)}% Completado
        </span>
      </div>
      <Progress value={progress} className="h-2" indicatorClassName="bg-sergen-500" />
    </div>
  );
};
