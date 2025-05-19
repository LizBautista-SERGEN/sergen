
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";

export const DashboardLayout = () => {
  return (
    <div className="flex flex-col min-h-screen pt-16">
      <div className="flex flex-1">
        <DashboardSidebar />
        <div className="flex-1 p-8 ml-[280px] transition-all">
          <Outlet />
        </div>
      </div>
      {/* This ensures the content pushes down the footer and the sidebar doesn't overlap it */}
      <div className="h-16"></div> 
    </div>
  );
};
