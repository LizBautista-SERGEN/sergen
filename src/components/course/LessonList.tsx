
import { Card } from "@/components/ui/card";
import { Check, Play, FileText } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  type: string;
  duration?: string;
  completed: boolean;
}

interface Unit {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface LessonListProps {
  units: Unit[];
  onLessonClick: (lesson: Lesson) => void;
}

export const LessonList = ({ units, onLessonClick }: LessonListProps) => {
  return (
    <div className="space-y-8">
      {units?.map((unit, index) => (
        <Card key={unit.id} className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-sergen-600">
            Unidad {index + 1}: {unit.title}
          </h2>
          <div className="space-y-3">
            {unit.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
                onClick={() => onLessonClick(lesson)}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  lesson.completed ? 'bg-sergen-100' : 'bg-gray-100'
                }`}>
                  <Check className={`h-4 w-4 ${
                    lesson.completed ? 'text-sergen-500' : 'text-gray-400'
                  }`} />
                </div>
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
                {lesson.type === 'video' ? (
                  <Play className="h-5 w-5 text-sergen-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <FileText className="h-5 w-5 text-sergen-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};
