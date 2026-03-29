import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { TermProvider } from "../context/TermContext";

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <TermProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-64 flex flex-col flex-1">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 pb-8">
            <div className="py-6">
              <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </TermProvider>
  );
};

export default Layout;