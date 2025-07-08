import TopNavigation from './TopNavigation';
import SidebarNav from './SidebarNav';

const AppHeader: React.FC = () => {
  return (
    <div className="bg-gray-50 p-6">
      <TopNavigation />
      <SidebarNav />
    </div>
  );
};

export default AppHeader;
