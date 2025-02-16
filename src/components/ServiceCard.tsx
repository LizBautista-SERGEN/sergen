
import { Card } from "@/components/ui/card";

interface ServiceCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
  onClick?: () => void;
}

const ServiceCard = ({ title, subtitle, description, icon, image, onClick }: ServiceCardProps) => {
  return (
    <Card 
      className={`group relative overflow-hidden p-6 h-full flex flex-col transition-all duration-300 hover:shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {image && (
        <div className="absolute inset-0 w-full h-full">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white/95 to-white/90" />
        </div>
      )}
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-sergen-100 text-sergen-700">
          {icon}
        </div>
        <div className="mb-2">
          <h3 className="text-xl font-semibold text-[#f39200]">{title}</h3>
          <p className="text-lg font-medium text-gray-900">{subtitle}</p>
        </div>
        <p className="text-gray-600 flex-grow">{description}</p>
      </div>
    </Card>
  );
};

export default ServiceCard;
