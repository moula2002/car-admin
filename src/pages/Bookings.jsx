import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Calendar, Clock, CreditCard, X, Trash2, UserPlus, RefreshCw, ChevronRight, Users, Car } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const TimerBadge = ({ booking }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!booking.timer || !booking.startTime) {
      setTimeLeft(null);
      setIsExpired(false);
      return;
    }
    const start = new Date(booking.startTime);
    const expiryTime = start.getTime() + booking.timer * 60000;
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = expiryTime - now;
      if (distance <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
      } else {
        setTimeLeft(distance);
        setIsExpired(false);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  const formatTime = (ms) => {
    if (ms <= 0) return 'Expired';
    const mins = Math.floor(ms / (1000 * 60));
    const secs = Math.floor((ms % (1000 * 60)) / 1000);
    return `${mins}m ${secs}s`;
  };

  if (!booking.timer || booking.status === 'Completed' || booking.status === 'Cancelled' || isExpired) return null;

  return (
    <span className="px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-lg flex items-center gap-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200/50 shadow-sm">
      <Clock size={12} className="animate-pulse" /> {timeLeft !== null ? formatTime(timeLeft) : `${booking.timer} mins`}
    </span>
  );
};

const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerMode, setCustomerMode] = useState('select'); // 'select' or 'create'

  const [formData, setFormData] = useState({
    customer: '', // customer ID for selection
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    pickupLocation: '',
    dropLocation: '',
    pickupDateTime: '',
    dropDateTime: '',
    fare: '',
    carType: '',
    timer: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, customersRes, vehiclesRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/customers'),
        api.get('/vehicle-types')
      ]);
      setBookings(bookingsRes.data.data);
      setCustomers(customersRes.data.data);
      setVehicleTypes(vehiclesRes.data.data);
    } catch (err) {
      toast.error('Failed to fetch bookings list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ride booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      setBookings(bookings.filter(b => b._id !== id));
      toast.success('Ride booking deleted successfully');
    } catch (err) {
      toast.error('Failed to delete booking');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const { data } = await api.put(`/bookings/${id}`, { status: 'Cancelled' });
      setBookings(bookings.map(b => b._id === id ? data.data : b));
      toast.success('Booking cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = {
        pickupLocation: formData.pickupLocation,
        dropLocation: formData.dropLocation,
        pickupDateTime: formData.pickupDateTime,
        dropDateTime: formData.dropDateTime,
        fare: Number(formData.fare)
      };

      if (customerMode === 'select') {
        const selectedCust = customers.find(c => c._id === formData.customer);
        if (!selectedCust) {
          toast.error('Please select an existing customer.');
          return;
        }
        payload.customerName = selectedCust.name;
        payload.customerPhone = selectedCust.phone;
        payload.customerEmail = selectedCust.email;
      } else {
        if (!formData.customerName || !formData.customerPhone) {
          toast.error('Customer name and phone number are required.');
          return;
        }
        payload.customerName = formData.customerName;
        payload.customerPhone = formData.customerPhone;
        payload.customerEmail = formData.customerEmail;
      }

      if (formData.carType) {
        payload.carType = formData.carType;
      }

      if (formData.timer) {
        payload.timer = Number(formData.timer);
      }

      const response = await api.post('/bookings/publish', payload);
      toast.success(formData.carType ? 'Ride published for specific car type!' : 'Ride published successfully and set to Pending!');

      setIsModalOpen(false);
      // Reset form
      setFormData({
        customer: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        pickupLocation: '',
        dropLocation: '',
        pickupDateTime: '',
        dropDateTime: '',
        fare: '',
        carType: '',
        timer: ''
      });
      fetchData(); // Refresh list to get verified populated info
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish ride.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/60 shadow-sm shadow-emerald-100';
      case 'Ongoing': return 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200/60 shadow-sm shadow-indigo-100';
      case 'Arrived': return 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200/60 shadow-sm shadow-indigo-100';
      case 'Accepted': return 'bg-blue-100 text-blue-700 ring-1 ring-blue-200/60 shadow-sm shadow-blue-100';
      case 'Pending': return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200/60 shadow-sm shadow-amber-100';
      case 'Cancelled': return 'bg-rose-100 text-rose-700 ring-1 ring-rose-200/60 shadow-sm shadow-rose-100';
      default: return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/60 shadow-sm shadow-slate-100';
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.dropLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="flex justify-between items-center p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-xl z-20">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Publish New Ride</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Create a new booking and dispatch to drivers</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 sm:p-8 space-y-6">

              {/* Customer Selector / Creator Toggle */}
              <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Customer Details</label>
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setCustomerMode('select')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${customerMode === 'select' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      Select
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerMode('create')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${customerMode === 'create' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                      <UserPlus size={12} /> Create New
                    </button>
                  </div>
                </div>

                {customerMode === 'select' ? (
                  <div>
                    <select
                      required
                      value={formData.customer}
                      onChange={e => setFormData({ ...formData, customer: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-semibold text-slate-900 shadow-sm transition-all"
                    >
                      <option value="">Select a customer...</option>
                      {customers.map(c => (
                         <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={formData.customerName}
                      onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={formData.customerPhone}
                      onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address (Optional)"
                      value={formData.customerEmail}
                      onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all sm:col-span-2"
                    />
                  </div>
                )}
              </div>

              {/* Vehicle Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Vehicle Type (Optional)</label>
                <select
                  value={formData.carType}
                  onChange={e => setFormData({ ...formData, carType: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-semibold text-slate-900 shadow-sm transition-all"
                >
                  <option value="">Any vehicle type</option>
                  {vehicleTypes.map(vt => (
                    <option key={vt._id} value={vt.name}>
                      {vt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Locations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Pickup Location *</label>
                  <input required type="text" value={formData.pickupLocation} onChange={e => setFormData({ ...formData, pickupLocation: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-semibold shadow-sm transition-all" placeholder="Airport Terminal 2" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Drop Location *</label>
                  <input required type="text" value={formData.dropLocation} onChange={e => setFormData({ ...formData, dropLocation: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-semibold shadow-sm transition-all" placeholder="Hotel Hyatt" />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Pickup Date & Time *</label>
                  <input required type="datetime-local" value={formData.pickupDateTime} onChange={e => setFormData({ ...formData, pickupDateTime: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-semibold cursor-pointer shadow-sm transition-all" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Drop Date & Time *</label>
                  <input required type="datetime-local" value={formData.dropDateTime} onChange={e => setFormData({ ...formData, dropDateTime: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-semibold cursor-pointer shadow-sm transition-all" />
                </div>
              </div>

              {/* Fare & Timer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Total Ride Fare Amount (₹) *</label>
                  <input required type="number" value={formData.fare} onChange={e => setFormData({ ...formData, fare: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-semibold shadow-sm transition-all" placeholder="2500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Timer (Minutes)</label>
                  <input type="number" value={formData.timer} onChange={e => setFormData({ ...formData, timer: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-semibold shadow-sm transition-all" placeholder="e.g. 15" />
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 hover:-translate-y-0.5">Publish Ride</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-white shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl leading-5 bg-white/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm font-medium transition-all shadow-sm"
              placeholder="Search rides by ID, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-48 px-4 py-3 border border-slate-200 rounded-2xl bg-white/80 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold shadow-sm transition-all cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Admin Accepted">Admin Accepted</option>
            <option value="Accepted">Accepted</option>
            <option value="Arrived">Arrived</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex gap-3 w-full lg:w-auto justify-end shrink-0">
          <button
            onClick={fetchData}
            className="bg-white hover:bg-slate-50 text-slate-600 p-3 rounded-2xl border border-slate-200 transition-all shadow-sm hover:shadow group"
          >
            <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white px-6 py-3 rounded-2xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 font-bold text-sm shadow-md">
            <Plus size={18} />
            Publish New Ride
          </button>
        </div>
      </div>

      {/* Rides List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
             <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
             <p className="text-slate-500 font-semibold animate-pulse">Loading ride dispatch list...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-medium bg-white rounded-3xl border border-slate-100/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-slate-400" />
             </div>
             No rides match your criteria
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 p-6 sm:p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group relative flex flex-col lg:flex-row justify-between gap-8">

              <div className="absolute top-6 right-6 flex gap-2 z-10">
                <button onClick={() => handleDelete(booking._id)} className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors" title="Delete Booking"><Trash2 size={18} /></button>
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                   <div className="flex items-center gap-3 mb-6 flex-wrap">
                     <h3 className="text-lg font-black text-slate-900">#{booking._id.substring(0, 8).toUpperCase()}</h3>
                     <span className={`px-3 py-1 text-[11px] font-black uppercase tracking-wider rounded-lg ${getStatusColor(booking.status)}`}>
                       {booking.status}
                     </span>
                     <TimerBadge booking={booking} />
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                     <div className="absolute left-[15px] top-[24px] bottom-[24px] w-px bg-slate-200 hidden md:block"></div>
                     <div className="flex items-start gap-4 relative z-10">
                       <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                         <MapPin size={16} className="text-indigo-500" />
                       </div>
                       <div>
                         {booking.carType && (
                           <div className="mb-3 inline-block bg-slate-100 px-2 py-1 rounded-md">
                             <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">Vehicle</p>
                             <p className="font-bold text-slate-700 text-xs">{booking.carType}</p>
                           </div>
                         )}
                         <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Pickup Location</p>
                         <p className="text-base font-bold text-slate-900 leading-tight">{booking.pickupLocation}</p>
                         <p className="text-xs text-slate-500 font-medium mt-1">{new Date(booking.pickupDateTime).toLocaleString()}</p>
                       </div>
                     </div>
                     
                     <div className="flex items-start gap-4 relative z-10">
                       <div className="w-8 h-8 rounded-full bg-rose-50 border-2 border-white shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                         <MapPin size={16} className="text-rose-500" />
                       </div>
                       <div>
                         <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Dropoff Location</p>
                         <p className="text-base font-bold text-slate-900 leading-tight">{booking.dropLocation}</p>
                         <p className="text-xs text-slate-500 font-medium mt-1">{new Date(booking.dropDateTime).toLocaleString()}</p>
                       </div>
                     </div>
                   </div>
                </div>
                
                <p className="text-[11px] font-bold text-slate-400 mt-6 pt-4 border-t border-slate-100/50">Published: {new Date(booking.createdAt).toLocaleString()}</p>
              </div>

              <div className="lg:w-80 bg-slate-50/50 rounded-2xl p-6 border border-slate-100/60 flex flex-col justify-between">
                <div className="space-y-5">
                   <div>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1"><Users size={12}/> Customer</p>
                     <p className="text-sm font-bold text-slate-900">{booking.customer ? booking.customer.name : 'Unknown Guest'}</p>
                     {booking.customer && (
                       <p className="text-xs text-slate-500 font-medium mt-0.5">{booking.customer.phone}</p>
                     )}
                   </div>
                   
                   <div>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1"><Car size={12}/> Assigned Driver</p>
                     <p className="text-sm font-bold text-slate-900">
                       {booking.driver ? booking.driver.name : <span className="text-slate-400 font-medium">Waiting for driver assignment...</span>}
                     </p>
                     {booking.driver && (
                       <p className="text-xs text-slate-500 font-medium mt-0.5">{booking.driver.phone} • UPI: {booking.driver.upiId || 'N/A'}</p>
                     )}
                   </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-200/60 flex items-end justify-between">
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Fare</p>
                     <span className="text-3xl font-black text-slate-900 tracking-tight">₹{booking.fare}</span>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold bg-white px-2.5 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                      <CreditCard size={14} className={booking.paymentStatus === 'Completed' ? 'text-emerald-500' : 'text-amber-500'} />
                      <span className={booking.paymentStatus === 'Completed' ? 'text-emerald-700' : 'text-amber-700'}>{booking.paymentStatus}</span>
                    </div>
                    {(booking.status === 'Pending' || booking.status === 'Accepted' || booking.status === 'Arrived') && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-sm border border-rose-100"
                      >
                        Cancel Ride
                      </button>
                    )}
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
