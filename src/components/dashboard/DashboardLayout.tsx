
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";

export const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen pt-16">
      <DashboardSidebar />
      <div className="flex-1 p-8 ml-[280px] transition-all">
        <Outlet />
      </div>
    </div>
  );
};
