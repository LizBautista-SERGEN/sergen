
import type { Course } from "@/types/course";

export const calculateCourseProgress = (course: Course) => {
  const totalItems = (course.course_units?.reduce(
    (acc, unit) => acc + unit.lessons.length,
    0
  ) || 0) + (course.explanation_videos?.length || 0);

  const completedLessons = course.course_units?.reduce(
    (acc, unit) => acc + unit.lessons.filter(lesson => lesson.completed).length,
    0
  ) || 0;

  return totalItems ? ((completedLessons) / totalItems) * 100 : 0;
};
