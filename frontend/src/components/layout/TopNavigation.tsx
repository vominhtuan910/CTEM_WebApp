import { useState } from 'react';
import {
  BellIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

import { NavLink } from 'react-router-dom';

const TopNavigation: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount] = useState(3);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/issues', label: 'Issues' },
    { to: '/assets', label: 'Assets' },
    { to: '/configurations', label: 'Configurations' },
    { to: '/reports', label: 'Reports' },
  ];

  return (
    <nav className="px-4 py-2 bg-white/70 backdrop-blur-lg shadow">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <ShieldCheckIcon className="h-7 w-7 text-white" />
            </div>
          </div>
          
          {/* Horizontal nav menu */}
          <ul className="hidden md:flex items-center gap-8 ml-6">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `relative px-1 py-2 text-base lg:text-lg transition-colors font-semibold ${
                      isActive
                        ? 'text-blue-600 font-semibold after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-0.5 after:bg-blue-600'
                        : 'text-slate-600 hover:text-blue-500'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
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
              <MagnifyingGlassIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors duration-200 h-4 w-4"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button className="p-3 bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 group">
                <BellIcon className="h-5 w-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                    {notificationCount}
                  </span>
                )}
              </button>
            </div>

            {/* Settings */}
            <button className="p-3 bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 group">
              <Cog6ToothIcon className="h-5 w-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
            </button>

            {/* User Profile */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <button className="relative p-1 bg-white rounded-full shadow-lg">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="h-6 w-6 text-white" />
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