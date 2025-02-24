
export interface ExplanationVideo {
  title: string;
  description: string;
  url: string;
}

export interface Lesson {
  id: string;
  title: string;
  type: string;
  duration: string | null;
  video_url: string | null;
  order_index: number;
  completed: boolean;
}

export interface CourseUnit {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  explanation_videos: ExplanationVideo[];
  course_units: CourseUnit[];
}
