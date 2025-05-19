
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";
import Footer from "../Footer";

export const DashboardLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <DashboardSidebar />
        <div className="flex-1 ml-[280px]">
          <div className="container mx-auto p-8">
            <Outlet />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
