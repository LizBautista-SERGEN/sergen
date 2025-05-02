
import { BarChart2, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";

export const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperUser } = useUserProfile();
  
  // Base links that all users can see
  const baseLinks = [
    { 
      label: "Control de Demanda", 
      href: "/servicios/control",
      icon: <BarChart2 className="text-neutral-700 dark:text-neutral-200 h-6 w-6 flex-shrink-0" />
    }
  ];
  
  // Add configuration link only for superusers
  const links = isSuperUser 
    ? [
      ...baseLinks,
      { 
        label: "Configuración", 
        href: "/configuracion",
        icon: <Settings className="text-neutral-700 dark:text-neutral-200 h-6 w-6 flex-shrink-0" />
      }
    ] 
    : baseLinks;

  const SidebarLink = ({ link, isActive }: { link: typeof links[0], isActive: boolean }) => {
    return (
      <button
        onClick={() => navigate(link.href)}
        className={`flex items-center justify-start gap-3 group py-4 w-full hover:bg-gray-100 rounded-lg px-4 ${
          isActive ? "bg-gray-100 font-medium" : ""
        }`}
      >
        {link.icon}
        <span className="text-neutral-700 dark:text-neutral-200 text-sm group-hover:translate-x-1 transition duration-150 whitespace-pre">
          {link.label}
        </span>
      </button>
    );
  };

  return (
    <div className="h-full min-w-[280px] flex-shrink-0 bg-white border-r border-gray-200 fixed top-16 left-0 z-40">
      <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6">
        <div className="mt-8 flex flex-col gap-4">
          {links.map((link, idx) => (
            <SidebarLink 
              key={idx} 
              link={link} 
              isActive={location.pathname === link.href || 
                (link.href !== "/" && location.pathname.startsWith(link.href))}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
