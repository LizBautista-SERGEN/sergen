
import { User, FileText, Plug, Book, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const menuItems = [
  { icon: User, label: "Perfil", route: "/perfil" },
  { icon: Plug, label: "Gestión Energética", route: "/gestion" },
  { icon: Book, label: "Cápsulas", route: "/capsulas" },
  { icon: FileText, label: "Informes", route: "/informes" },
];

export const DashboardSidebar = () => {
  const navigate = useNavigate();

  return (
    <>
      <Sidebar className="border-r border-gray-200">
        <SidebarHeader className="p-4 border-b">
          <h2 className="text-lg font-semibold">Panel de Control</h2>
        </SidebarHeader>
        <SidebarContent>
          <nav className="space-y-1 p-2">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.route)}
                className="flex items-center space-x-3 w-full p-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </SidebarContent>
      </Sidebar>
      <div className="p-4 border-b flex items-center">
        <SidebarTrigger>
          <Menu className="w-6 h-6" />
        </SidebarTrigger>
      </div>
    </>
  );
};
