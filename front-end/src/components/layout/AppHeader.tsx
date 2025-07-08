import TopNavigation from './TopNavigation';
import SidebarNav from './SidebarNav';
import { Outlet } from 'react-router-dom';

const AppHeader: React.FC = () => {
  return (
    <div className="bg-gray-50 p-6">
      <TopNavigation />
      <SidebarNav />
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AppHeader;
