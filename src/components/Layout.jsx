import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Car,
  Navigation,
  MapPin,
  CalendarCheck,
  CreditCard,
  Settings,
  LogOut,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, text, to, active }) => (
  <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }`}>
  <Icon size={20} className={active ? 'text-white' : 'text-gray-400'} />
  <span className="font-medium">{text}</span>
  </Link>
);

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSidebarClick = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans relative">
      {/* Background overlay for mobile */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)} 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-full transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="p-6 flex items-center justify-between lg:justify-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Car size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">CabAdmin</h1>
            </div>
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="px-4 space-y-1">
            <div onClick={handleSidebarClick}>
              <SidebarItem icon={LayoutDashboard} text="Dashboard" to="/dashboard" active={location.pathname === '/dashboard'} />
            </div>
            <div onClick={handleSidebarClick}>
              <SidebarItem icon={Users} text="Customers" to="/customers" active={location.pathname === '/customers'} />
            </div>
            <div onClick={handleSidebarClick}>
              <SidebarItem icon={CheckCircle} text="Verification" to="/verification" active={location.pathname === '/verification' || location.pathname.startsWith('/verification/')} />
            </div>
            <div onClick={handleSidebarClick}>
              <SidebarItem icon={Navigation} text="Drivers" to="/drivers" active={location.pathname === '/drivers' || location.pathname.startsWith('/drivers/')} />
            </div>
            <div onClick={handleSidebarClick}>
              <SidebarItem icon={Car} text="Vehicles" to="/vehicles" active={location.pathname === '/vehicles'} />
            </div>
            <div onClick={handleSidebarClick}>
              <SidebarItem icon={CalendarCheck} text="Bookings" to="/bookings" active={location.pathname === '/bookings'} />
            </div>
            <div onClick={handleSidebarClick}>
              <SidebarItem icon={CreditCard} text="Payments History" to="/payments" active={location.pathname === '/payments'} />
            </div>
            <div onClick={handleSidebarClick}>
              <SidebarItem icon={Settings} text="Settings" to="/settings" active={location.pathname === '/settings'} />
            </div>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 sm:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl cursor-pointer"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 capitalize">
              {location.pathname.replace('/', '')}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-8 pb-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
