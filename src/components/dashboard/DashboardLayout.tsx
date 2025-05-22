
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";

export const DashboardLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <DashboardSidebar />
        <div className="flex-1 ml-[280px] flex flex-col">
          <div className="container mx-auto p-8 flex-1 mt-10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
