
import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ExplanationVideo {
  title: string;
  description: string;
  url: string;
}

interface ExplanationVideosProps {
  videos: ExplanationVideo[];
  courseId: string;
  onVideoComplete: () => void;
}

export const ExplanationVideos = ({ videos, courseId, onVideoComplete }: ExplanationVideosProps) => {
  const [watchedVideos, setWatchedVideos] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const fetchVideoProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_video_progress')
        .select('video_index')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .eq('completed', true);

      if (error) {
        console.error('Error fetching video progress:', error);
        return;
      }

      const completedIndexes = new Set(data.map(row => row.video_index));
      setWatchedVideos(completedIndexes);
    };

    fetchVideoProgress();
  }, [courseId]);

  const handleVideoComplete = async (index: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_video_progress')
      .upsert({
        user_id: user.id,
        course_id: courseId,
        video_index: index,
        completed: true
      });

    if (error) {
      console.error('Error updating video progress:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el progreso del video.",
        variant: "destructive"
      });
      return;
    }

    setWatchedVideos(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
    
    onVideoComplete();
    
    toast({
      title: "Video completado",
      description: "Tu progreso ha sido actualizado.",
    });
  };

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Video className="h-5 w-5 text-sergen-500" />
        <h3 className="font-semibold text-gray-700">Videos explicativos</h3>
      </div>
      
      <Accordion type="single" collapsible className="space-y-4">
        {videos.map((video, index) => (
          <AccordionItem 
            key={index} 
            value={`video-${index}`}
            className="border rounded-lg px-4"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  watchedVideos.has(index) ? 'bg-sergen-100' : 'bg-gray-100'
                }`}>
                  <Check className={`h-4 w-4 ${
                    watchedVideos.has(index) ? 'text-sergen-500' : 'text-gray-400'
                  }`} />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">{video.title}</h4>
                  <p className="text-sm text-gray-500">{video.description}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <div className="relative aspect-video">
                <iframe
                  src={video.url}
                  className="absolute inset-0 w-full h-full rounded-md"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onEnded={() => handleVideoComplete(index)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
