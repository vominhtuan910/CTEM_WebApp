import { ShieldCheckIcon } from "@heroicons/react/24/outline";

import { NavLink } from "react-router-dom";

const TopNavigation: React.FC = () => {
  const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/issues", label: "Issues" },
    { to: "/assets", label: "Assets" },
    //{ to: "/reports", label: "Reports" },
  ];

  return (
    <nav className="px-4 py-2 bg-black">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
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
                    `relative px-1 py-2 text-base lg:text-lg transition-colors font-semibold uppercase ${
                      isActive
                        ? "text-blue-400 font-semibold after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-0.5 after:bg-blue-400"
                        : "text-white hover:text-blue-300"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
