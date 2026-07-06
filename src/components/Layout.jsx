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
  LogOut 
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, text, to, active }) => (
  <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
    active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
  }`}>
    <Icon size={20} className={active ? 'text-white' : 'text-gray-400'} />
    <span className="font-medium">{text}</span>
  </Link>
);

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-full">
        <div>
          <div className="p-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Car size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">CabAdmin</h1>
          </div>
          <nav className="px-4 space-y-1">
            <SidebarItem icon={LayoutDashboard} text="Dashboard" to="/dashboard" active={location.pathname === '/dashboard'} />
            <SidebarItem icon={Users} text="Customers" to="/customers" active={location.pathname === '/customers'} />
            <SidebarItem icon={Navigation} text="Drivers" to="/drivers" active={location.pathname === '/drivers'} />
            <SidebarItem icon={Car} text="Cars" to="/cars" active={location.pathname === '/cars'} />
            <SidebarItem icon={CalendarCheck} text="Bookings" to="/bookings" active={location.pathname === '/bookings'} />
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
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {location.pathname.replace('/', '')}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 pb-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
