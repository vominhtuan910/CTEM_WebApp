import { Outlet } from "react-router-dom";

import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <AppHeader />
      <main className="flex-1 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_70%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.05),transparent_70%)] pointer-events-none"></div>
        
        {/* Content */}
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default AppLayout;