import { NavLink } from 'react-router-dom';

import DashboardIcon from '@mui/icons-material/Dashboard';
import BugReportIcon from '@mui/icons-material/BugReport';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';

const SidebarNav: React.FC = () => {
  const navigationItems = [
    { to: '/dashboard', icon: DashboardIcon, label: 'Dashboard' },
    { to: '/issues', icon: BugReportIcon, label: 'Issues' },
    { to: '/assets', icon: AssessmentIcon, label: 'Assets' },
    { to: '/chart', icon: SecurityIcon, label: 'Reports' },
  ];

  return (
    <nav className="border-b border-slate-200 bg-white/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center space-x-8">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default SidebarNav;
