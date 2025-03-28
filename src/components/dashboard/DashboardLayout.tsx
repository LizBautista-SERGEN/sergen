
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";

export const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen pt-16">
      <DashboardSidebar />
      <div className="flex-1 p-8 pl-24 md:pl-[320px] transition-all">
        <Outlet />
      </div>
    </div>
  );
};
