import { useState } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col w-full xl:w-[calc(100%-288px)] xl:ml-72">
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto px-5 py-6 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;