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
  Activity,
  Bell
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, text, to, active }) => (
  <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900'
    }`}>
    {active && (
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
    )}
  <Icon size={20} className={`relative z-10 transition-transform duration-300 ${active ? 'text-white scale-110' : 'text-slate-400 group-hover:scale-110 group-hover:text-indigo-500'}`} />
  <span className="font-semibold relative z-10">{text}</span>
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
    <div className="flex h-screen overflow-hidden font-sans relative bg-slate-50">
      {/* Background overlay for mobile */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl border-r border-slate-200/50 flex flex-col justify-between h-full transform transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 lg:static lg:z-auto m-0 lg:m-4 lg:rounded-3xl lg:h-[calc(100vh-2rem)] ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="p-6 pt-8 flex items-center justify-between lg:justify-start gap-2">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                <img src={logoImg} alt="Route Cabs Logo" className="h-[36px] w-auto object-contain" />
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight">Route Cabs</span>
            </div>
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide space-y-1.5">
            <div onClick={handleSidebarClick}>
              <SidebarItem icon={LayoutDashboard} text="Overview" to="/dashboard" active={location.pathname === '/dashboard'} />
            </div>
            <div onClick={handleSidebarClick}>
              <SidebarItem icon={Users} text="Customers" to="/customers" active={location.pathname === '/customers'} />
            </div>
            <div onClick={handleSidebarClick}>
              <SidebarItem icon={Navigation} text="Drivers" to="/drivers" active={location.pathname === '/drivers' || location.pathname.startsWith('/drivers/')} />
            </div>
            <div onClick={handleSidebarClick}>
              <SidebarItem icon={CheckCircle} text="Verification" to="/verification" active={location.pathname === '/verification' || location.pathname.startsWith('/verification/')} />
            </div>
            <div onClick={handleSidebarClick}>
              <SidebarItem icon={Car} text="Vehicles" to="/vehicles" active={location.pathname === '/vehicles'} />
            </div>
            
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Operations</p>
            </div>
            
            <div onClick={handleSidebarClick}>
              <SidebarItem icon={CalendarCheck} text="Bookings" to="/bookings" active={location.pathname === '/bookings'} />
            </div>
            <div onClick={handleSidebarClick}>
              <SidebarItem icon={Activity} text="Live Rides" to="/ongoing-rides" active={location.pathname === '/ongoing-rides'} />
            </div>
            <div onClick={handleSidebarClick}>
              <SidebarItem icon={CreditCard} text="Transactions" to="/payments" active={location.pathname === '/payments'} />
            </div>
            
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">System</p>
            </div>
            <div onClick={handleSidebarClick}>
              <SidebarItem icon={Settings} text="Settings" to="/settings" active={location.pathname === '/settings'} />
            </div>
          </div>
        </div>
        
        <div className="p-4 mt-auto">
          <div className="bg-slate-100/50 rounded-2xl p-4 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-bold shadow-md">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">admin@routecabs.com</p>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            className="flex items-center justify-center gap-2 px-4 py-3 w-full text-center text-rose-600 font-semibold hover:bg-rose-50 hover:shadow-sm rounded-2xl transition-all duration-300"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 px-6 sm:px-10 py-4 flex justify-between items-center transition-all">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2.5 text-slate-500 hover:text-slate-900 bg-white shadow-sm border border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer transition-all"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 capitalize tracking-tight">
                {location.pathname.replace('/', '').replace('-', ' ') || 'Dashboard'}
              </h2>
              <p className="text-sm text-slate-500 hidden sm:block">Manage your operations efficiently</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-5">
            <button className="relative p-2.5 text-slate-500 hover:text-indigo-600 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-indigo-200 transition-all group">
              <Bell size={20} className="group-hover:animate-swing" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="hidden sm:flex items-center gap-3 pl-5 border-l border-slate-200">
               <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">Admin</p>
                  <p className="text-xs text-slate-500">Superuser</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20 cursor-pointer hover:scale-105 transition-transform">
                 A
               </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 pb-24 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mb-6 mx-auto">
              <LogOut size={28} />
            </div>
            <h3 className="text-2xl font-bold text-center text-slate-900 mb-2">Sign Out</h3>
            <p className="text-slate-500 text-center mb-8 text-sm leading-relaxed">
              Are you sure you want to end your session? You will need to log in again to access the admin panel.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 px-4 py-3 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="flex-1 px-4 py-3 font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-md shadow-rose-500/20 transition-all hover:-translate-y-0.5"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
