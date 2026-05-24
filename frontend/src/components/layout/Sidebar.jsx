import { NavLink } from 'react-router-dom';
import {
  FaChartLine,
  FaUsers,
  FaWallet,
  FaBoxOpen,
  FaFileAlt,
  FaCog,
  FaTimes,
  FaSync,
  FaReceipt
} from 'react-icons/fa';

const navItems = [
  { label: 'Dashboard', path: '/', icon: FaChartLine },
  { label: 'Members', path: '/members', icon: FaUsers },
  { label: 'Renewals', path: '/renewals', icon: FaSync },
  { label: 'Payments', path: '/payments', icon: FaWallet },
  { label: 'Expenses', path: '/expenses', icon: FaReceipt },
  { label: 'Packages', path: '/packages', icon: FaBoxOpen },
  { label: 'Reports', path: '/reports', icon: FaFileAlt },
  { label: 'Settings', path: '/settings', icon: FaCog }
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 transform overflow-y-auto border-r border-slate-200 bg-white text-slate-900 shadow-2xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100
        ${
          sidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full xl:translate-x-0'
        }`}
      >
        <div className="flex h-full flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800 xl:hidden">
            <h2 className="text-lg font-bold">Gym ERP</h2>

            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-red-500 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Logo Section */}
          <div className="px-6 py-8 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-md dark:border-slate-700 dark:bg-slate-800">
              <img
                src="http://localhost/gym/backend/uploads/gymlogo.jpg"
                alt="Gym Logo"
                className="h-full w-full object-contain p-2"
                onError={(e) => {
                  e.target.src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%230ea5e9" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle"%3EGYM%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>

            <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              Gym ERP
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Admin Management System
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 pb-6">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon
                    size={18}
                    className="transition-transform duration-200 group-hover:scale-110"
                  />

                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <div className="rounded-2xl bg-slate-100 p-4 text-center dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Powered By
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                ORIAN FITNESS
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;