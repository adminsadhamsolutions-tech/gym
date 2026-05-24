import {
  FaBell,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaBars
} from 'react-icons/fa';

import { useAuth } from '../../auth/authContext';
import { useTheme } from '../../theme/ThemeContext';

const Topbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        
        {/* Left Section */}
        <div className="flex min-w-0 items-center gap-3">
          
          {/* Mobile Menu */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-2xl border border-slate-200 bg-slate-100 p-3 text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 xl:hidden"
          >
            <FaBars size={18} />
          </button>

          {/* Title */}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-900 dark:text-white sm:text-2xl">
              Gym ERP Dashboard
            </h1>

            <p className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">
              Manage members, renewals, payments, packages, and reports.
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Alerts */}
          <button
            className="relative rounded-2xl border border-slate-200 bg-slate-100 p-3 text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FaBell size={16} />

            {/* Notification Dot */}
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? (
              <>
                <FaSun size={15} />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <FaMoon size={15} />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
          >
            <FaSignOutAlt size={15} />

            <span className="hidden sm:inline">
              Logout
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;