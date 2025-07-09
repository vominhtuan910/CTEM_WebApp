import { NavLink } from 'react-router-dom';

import DashboardIcon from '@mui/icons-material/Dashboard';
import BugReportIcon from '@mui/icons-material/BugReport';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';

const SidebarNav: React.FC = () => {
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1 ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-700'} hover:text-blue-600 underline`;

  return (
    <nav className="mb-8 flex items-center gap-6 border-b border-gray-200 pb-4">
      <NavLink to="/dashboard" className={linkClasses}>
        <DashboardIcon fontSize="small" />
        Dashboard
      </NavLink>
      <NavLink to="/issues" className={linkClasses}>
        <BugReportIcon fontSize="small" />
        Issues
      </NavLink>
      <NavLink to="/assets" className={linkClasses}>
        <AssessmentIcon fontSize="small" />
        Assets
      </NavLink>
      <NavLink to="/chart" className={linkClasses}>
        <SecurityIcon fontSize="small" />
        Chart
      </NavLink>
    </nav>
  );
};

export default SidebarNav;
