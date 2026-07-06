import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Car, Navigation, DollarSign, TrendingUp, CalendarCheck } from 'lucide-react';
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

const StatCard = ({ title, value, icon: Icon, trend, trendUp }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
        <Icon size={24} />
      </div>
      <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {trendUp ? '+' : ''}{trend}
      </div>
    </div>
    <div className="relative z-10">
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeDrivers: 0,
    totalCars: 0,
    totalBookings: 0,
    totalRevenue: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data.data);
      } catch (err) {
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-500 font-medium animate-pulse">Loading Dashboard Insights...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} trend="12.5%" trendUp={true} />
        <StatCard title="Total Bookings" value={stats.totalBookings.toLocaleString()} icon={CalendarCheck} trend="8.2%" trendUp={true} />
        <StatCard title="Active Drivers" value={stats.activeDrivers.toLocaleString()} icon={Navigation} trend="2.4%" trendUp={true} />
        <StatCard title="Total Customers" value={stats.totalCustomers.toLocaleString()} icon={Users} trend="14.1%" trendUp={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Car size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New booking #CB-{4920 + i}</p>
                  <p className="text-xs text-gray-500 mt-1">John Doe • 2 mins ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
