import { NavLink, useLocation } from 'react-router-dom';

import DashboardIcon from '@mui/icons-material/Dashboard';
import BugReportIcon from '@mui/icons-material/BugReport';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const SidebarNav: React.FC = () => {
  const location = useLocation();

  const navigationItems = [
    {
      to: '/dashboard',
      icon: DashboardIcon,
      label: 'Dashboard',
      description: 'Security overview',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'from-blue-600 to-blue-700',
    },
    {
      to: '/issues',
      icon: BugReportIcon,
      label: 'Issues',
      description: 'Vulnerabilities',
      gradient: 'from-red-500 to-red-600',
      hoverGradient: 'from-red-600 to-red-700',
    },
    {
      to: '/assets',
      icon: AssessmentIcon,
      label: 'Assets',
      description: 'Infrastructure',
      gradient: 'from-emerald-500 to-emerald-600',
      hoverGradient: 'from-emerald-600 to-emerald-700',
    },
    {
      to: '/chart',
      icon: SecurityIcon,
      label: 'Analytics',
      description: 'Threat analysis',
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'from-purple-600 to-purple-700',
    },
  ];

  const getNavItemClasses = (isActive: boolean, gradient: string, hoverGradient: string) => {
    if (isActive) {
      return `relative group flex flex-col items-center gap-2 px-6 py-4 bg-gradient-to-br ${gradient} text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`;
    }
    return `relative group flex flex-col items-center gap-2 px-6 py-4 bg-white/60 hover:bg-gradient-to-br hover:${hoverGradient} hover:text-white text-slate-700 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300`;
  };

  return (
    <nav className="mb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={getNavItemClasses(isActive, item.gradient, item.hoverGradient)}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
                )}
                
                {/* Icon with background */}
                <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-white/40 group-hover:bg-white/20'} transition-all duration-300`}>
                  <Icon className="h-6 w-6" />
                </div>
                
                {/* Label and description */}
                <div className="text-center">
                  <div className="font-bold text-sm leading-tight">
                    {item.label}
                  </div>
                  <div className={`text-xs leading-tight ${isActive ? 'text-white/80' : 'text-slate-500 group-hover:text-white/80'} transition-colors duration-300`}>
                    {item.description}
                  </div>
                </div>
                
                {/* Trending indicator for active item */}
                {isActive && (
                  <div className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-lg">
                    <TrendingUpIcon className="h-4 w-4 text-emerald-600" />
                  </div>
                )}
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </NavLink>
            );
          })}
        </div>
        
        {/* Navigation stats */}
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-6 px-6 py-3 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm">
            <div className="text-center">
              <div className="text-xs text-slate-500 font-medium">Active Monitors</div>
              <div className="text-lg font-bold text-slate-800">24/7</div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="text-center">
              <div className="text-xs text-slate-500 font-medium">Security Level</div>
              <div className="text-lg font-bold text-emerald-600">HIGH</div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="text-center">
              <div className="text-xs text-slate-500 font-medium">Last Scan</div>
              <div className="text-lg font-bold text-blue-600">2m ago</div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SidebarNav;
