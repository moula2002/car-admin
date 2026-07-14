import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, Car, Navigation, IndianRupee, TrendingUp, CalendarCheck, Clock, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const revenueData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 2000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 2390 },
  { name: 'Sun', revenue: 3490 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendUp, color }) => {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
  };
  
  const iconColor = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-white rounded-3xl p-6 relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1">
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3.5 rounded-2xl ${iconColor} ring-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full ${trendUp ? 'bg-emerald-100/60 text-emerald-700' : 'bg-rose-100/60 text-rose-700'}`}>
          {trendUp ? <TrendingUp size={14} /> : null}
          {trendUp ? '+' : ''}{trend}
        </div>
      </div>
      <div className="relative z-10 mt-2">
        <h3 className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h2>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeDrivers: 0,
    totalCars: 0,
    totalBookings: 0,
    totalRevenue: 0
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/bookings')
        ]);
        setStats(statsRes.data.data);
        
        // Get the 5 most recent bookings
        const allBookings = bookingsRes.data.data;
        const sortedBookings = allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentBookings(sortedBookings.slice(0, 5));
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
      <p className="text-slate-500 font-semibold animate-pulse">Loading amazing insights...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
         <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
               Welcome back, Admin <span className="animate-bounce inline-block">👋</span>
            </h1>
            <p className="text-indigo-100 font-medium text-lg max-w-xl">Here is what's happening with your operations today. Everything is looking great!</p>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={IndianRupee} trend="12.5%" trendUp={true} color="indigo" />
        <StatCard title="Total Bookings" value={stats.totalBookings.toLocaleString()} icon={CalendarCheck} trend="8.2%" trendUp={true} color="emerald" />
        <StatCard title="Active Drivers" value={stats.activeDrivers.toLocaleString()} icon={Navigation} trend="2.4%" trendUp={true} color="blue" />
        <StatCard title="Total Customers" value={stats.totalCustomers.toLocaleString()} icon={Users} trend="14.1%" trendUp={true} color="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 relative z-10 gap-4">
             <div>
               <h3 className="text-xl font-black text-slate-900">Revenue Overview</h3>
               <p className="text-sm text-slate-500 mt-1 font-medium">Weekly earnings summary</p>
             </div>
             <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm cursor-pointer hover:bg-slate-100 transition-colors">
               <option>This Week</option>
               <option>Last Week</option>
               <option>This Month</option>
             </select>
          </div>
          
          <div className="h-80 relative z-10 ml-[-20px] sm:ml-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} tickFormatter={(value) => `₹${value}`} dx={-10} />
                <Tooltip 
                  cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', fontWeight: 600, color: '#0f172a', padding: '12px 16px' }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-black text-slate-900">Recent Activity</h3>
             <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors">
               View All
             </button>
          </div>
          
          <div className="space-y-6 relative flex-1">
            <div className="absolute top-4 bottom-4 left-[23px] w-0.5 bg-slate-100"></div>
            
            {recentBookings.length === 0 ? (
              <div className="text-center py-10">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <Clock size={24} className="text-slate-400" />
                 </div>
                 <p className="text-sm font-semibold text-slate-500">No recent activity found.</p>
              </div>
            ) : (
              recentBookings.map((booking, index) => {
                const timeAgo = (dateStr) => {
                  const diff = Math.floor((new Date() - new Date(dateStr)) / 60000); // minutes
                  if (diff < 60) return `${diff}m ago`;
                  const hours = Math.floor(diff / 60);
                  if (hours < 24) return `${hours}h ago`;
                  return `${Math.floor(hours / 24)}d ago`;
                };

                return (
                  <div key={booking._id} className="flex items-start gap-4 relative z-10 group">
                    <div className="w-[48px] h-[48px] rounded-2xl bg-white border border-slate-100 shadow-sm text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-emerald-200 group-hover:shadow-emerald-100 transition-all z-10">
                      <CheckCircle2 size={24} className="fill-emerald-50 text-emerald-500" />
                    </div>
                    <div className="bg-slate-50 group-hover:bg-indigo-50/30 rounded-2xl p-4 flex-1 border border-slate-100 group-hover:border-indigo-100 transition-all">
                      <div className="flex justify-between items-start mb-1.5">
                        <p className="text-sm font-black text-slate-900">
                          Booking #{booking._id.substring(0, 6)}
                        </p>
                        <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 shadow-sm px-2 py-1 rounded-lg">
                          {timeAgo(booking.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        <span className="text-slate-900 font-bold">{booking.customer ? booking.customer.name : 'Unknown User'}</span> requested a ride from <span className="text-indigo-600 font-semibold">{booking.pickupLocation.split(',')[0]}</span>
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
