import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
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
  X,
  Activity
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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const confirmLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
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
              <img src={logoImg} alt="Route Cabs Logo" className="h-[48px] object-contain ml-2 mt-2" />
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
              <SidebarItem icon={Activity} text="Ongoing Rides" to="/ongoing-rides" active={location.pathname === '/ongoing-rides'} />
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
            onClick={handleLogoutClick}
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
            <button 
              onClick={handleLogoutClick}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
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

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-gray-900">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <LogOut size={20} />
              </div>
              <h3 className="text-xl font-bold">Confirm Logout</h3>
            </div>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Are you sure you want to log out of the Admin Panel? You will need to sign in again to access the dashboard.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="px-4 py-2 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
