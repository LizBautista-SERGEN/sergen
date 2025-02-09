
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ChevronDown, Play, Video } from "lucide-react";

interface ExplanationVideo {
  title: string;
  description: string;
  url: string;
}

interface ExplanationVideosProps {
  videos: ExplanationVideo[];
}

export const ExplanationVideos = ({ videos }: ExplanationVideosProps) => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

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
                <Play className="h-4 w-4 text-sergen-500" />
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
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
