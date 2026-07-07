import { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Calendar, Clock, CreditCard, X, Edit2, Trash2 } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    customer: '', 
    driver: '',
    car: '',
    pickupLocation: '', 
    dropLocation: '', 
    journeyDate: '', 
    timeSlot: '', 
    fare: 0 
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, customersRes, driversRes, carsRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/customers'),
        api.get('/drivers'),
        api.get('/cars')
      ]);
      setBookings(bookingsRes.data.data);
      setCustomers(customersRes.data.data);
      setDrivers(driversRes.data.data);
      setCars(carsRes.data.data);
    } catch (err) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      setBookings(bookings.filter(b => b._id !== id));
      toast.success('Booking deleted successfully');
    } catch (err) {
      toast.error('Failed to delete booking');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.driver) {
        delete payload.driver;
      }
      if (!payload.car) {
        delete payload.car;
      }
      const { data } = await api.post('/bookings', payload);
      
      // Hydrate the new booking with the full objects so they render correctly immediately
      const newBooking = {
        ...data.data,
        customer: customers.find(c => c._id === data.data.customer) || null,
        driver: drivers.find(d => d._id === data.data.driver) || null,
        car: cars.find(c => c._id === data.data.car) || null
      };

      setBookings([newBooking, ...bookings]);
      setIsModalOpen(false);
      setFormData({ customer: '', driver: '', car: '', pickupLocation: '', dropLocation: '', journeyDate: '', timeSlot: '', fare: 0 });
      toast.success('Booking created successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create booking');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800';
      case 'Ongoing': return 'bg-blue-100 text-blue-800';
      case 'Confirmed': return 'bg-indigo-100 text-indigo-800';
      case 'Cancelled': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Create New Booking</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
                  <select required value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">Select a customer...</option>
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Driver (Optional)</label>
                  <select value={formData.driver} onChange={e => setFormData({...formData, driver: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">No Driver Assigned</option>
                    {drivers.map(d => (
                      <option key={d._id} value={d._id}>{d.name} - {d.status === 'Active' ? 'Active' : d.status}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Car (Optional)</label>
                  <select value={formData.car} onChange={e => setFormData({...formData, car: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">No Car Assigned</option>
                    {cars.map(c => (
                      <option key={c._id} value={c._id}>{c.make} {c.model} ({c.registrationNumber})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                  <input required type="text" value={formData.pickupLocation} onChange={e => setFormData({...formData, pickupLocation: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Airport" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Drop Location</label>
                  <input required type="text" value={formData.dropLocation} onChange={e => setFormData({...formData, dropLocation: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Downtown" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Journey Date</label>
                  <input required type="date" value={formData.journeyDate} onChange={e => setFormData({...formData, journeyDate: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input 
                  required 
                  type="time" 
                  value={formData.timeSlot} 
                  onChange={e => setFormData({...formData, timeSlot: e.target.value})} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Fare (₹)</label>
                <input required type="number" value={formData.fare} onChange={e => setFormData({...formData, fare: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="45.00" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-xl transition-colors shadow-sm">Create Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium">
          <Plus size={20} />
          New Booking
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500 font-medium">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-10 text-gray-500 font-medium">No bookings found</div>
        ) : (
          bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative">
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                <button onClick={() => handleDelete(booking._id)} className="p-2 bg-white rounded-full shadow-sm text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
              </div>

              <div className="flex flex-col lg:flex-row justify-between gap-6">
                
                <div className="flex-1">
                  <div className="flex flex-col gap-1 mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900">#{booking._id.substring(0, 8)}</h3>
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">Created: {new Date(booking.createdAt).toLocaleString()}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-6 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin size={18} className="text-indigo-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Pickup</p>
                        <p className="text-sm font-medium text-gray-900">{booking.pickupLocation}</p>
                      </div>
                    </div>
                    <div className="hidden sm:block w-px bg-gray-200"></div>
                    <div className="flex items-start gap-2">
                      <MapPin size={18} className="text-rose-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Drop</p>
                        <p className="text-sm font-medium text-gray-900">{booking.dropLocation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5"><Calendar size={16} /> {new Date(booking.journeyDate).toLocaleDateString()}</div>
                    <div className="flex items-center gap-1.5"><Clock size={16} /> {booking.timeSlot}</div>
                  </div>
                </div>

                <div className="lg:w-64 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Customer</p>
                    <p className="text-sm font-medium text-gray-900">{booking.customer ? booking.customer.name : 'Unknown'}</p>
                    {booking.customer && (
                      <p className="text-xs text-gray-500 mb-3">{booking.customer.phone} • {booking.customer.email}</p>
                    )}
                    
                    <p className="text-xs text-gray-500 mb-1 mt-2">Driver & Car</p>
                    <p className="text-sm font-medium text-gray-900">{booking.driver ? booking.driver.name : 'Unassigned'}</p>
                    {booking.driver && <p className="text-xs text-gray-500">{booking.driver.phone}</p>}
                    <p className="text-xs text-gray-500 mt-1">{booking.car ? `${booking.car.make} ${booking.car.model} (${booking.car.registrationNumber})` : 'No car'}</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">₹{booking.fare}</span>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <CreditCard size={14} className={booking.paymentStatus === 'Completed' ? 'text-emerald-500' : 'text-amber-500'} />
                      <span className={booking.paymentStatus === 'Completed' ? 'text-emerald-700' : 'text-amber-700'}>{booking.paymentStatus}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Bookings;
