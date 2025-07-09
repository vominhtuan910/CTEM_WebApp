import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';

const TopNavigation: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount] = useState(3);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <nav className="p-6 bg-white/70 backdrop-blur-lg shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <SecurityIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <div>
            <span className="text-2xl font-black text-slate-800 tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CTEM SYSTEM
            </span>
            <p className="text-sm text-slate-600 font-medium -mt-1">
              Cyber Threat & Exposure Management
            </p>
          </div>
        </div>

        {/* Search and Actions Section */}
        <div className="flex items-center gap-4">
          {/* Enhanced Search */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search security events..."
                className="w-64 pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-500 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 shadow-sm"
              />
              <SearchIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors duration-200"
                fontSize="small"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button className="p-3 bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 group">
                <NotificationsIcon className="h-5 w-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                    {notificationCount}
                  </span>
                )}
              </button>
            </div>

            {/* Settings */}
            <button className="p-3 bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 group">
              <SettingsIcon className="h-5 w-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
            </button>

            {/* User Profile */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <button className="relative p-1 bg-white rounded-full shadow-lg">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <PersonIcon className="h-6 w-6 text-white" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;