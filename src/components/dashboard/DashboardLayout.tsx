
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";

export const DashboardLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <DashboardSidebar />
        <div className="flex-1 p-8 ml-[280px] pt-16">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
      <div className="h-16"></div> 
    </div>
  );
};
