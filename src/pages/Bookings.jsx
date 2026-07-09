import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Calendar, Clock, CreditCard, X, Trash2, UserPlus, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
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
    fare: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, customersRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/customers')
      ]);
      setBookings(bookingsRes.data.data);
      setCustomers(customersRes.data.data);
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

      const response = await api.post('/bookings/publish', payload);
      toast.success('Ride published successfully and set to Pending!');
      
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
        fare: 0
      });
      fetchData(); // Refresh list to get verified populated info
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish ride.');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'Ongoing': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Arrived': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'Accepted': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Pending': return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 border border-rose-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const filteredBookings = bookings.filter(b =>
    b._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.dropLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">Publish New Ride Offer</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
              
              {/* Customer Selector / Creator Toggle */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Customer Info</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomerMode('select')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        customerMode === 'select' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      Select Existing
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerMode('create')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        customerMode === 'create' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
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
                      onChange={e => setFormData({...formData, customer: e.target.value})} 
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 text-sm font-semibold text-gray-900 mt-2"
                    >
                      <option value="">Select a customer...</option>
                      {customers.map(c => (
                        <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <input
                      type="text"
                      placeholder="Name *"
                      value={formData.customerName}
                      onChange={e => setFormData({...formData, customerName: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-600"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone *"
                      value={formData.customerPhone}
                      onChange={e => setFormData({...formData, customerPhone: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-600"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email (Optional)"
                      value={formData.customerEmail}
                      onChange={e => setFormData({...formData, customerEmail: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-600 sm:col-span-2"
                    />
                  </div>
                )}
              </div>

              {/* Locations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Pickup Location *</label>
                  <input required type="text" value={formData.pickupLocation} onChange={e => setFormData({...formData, pickupLocation: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 text-sm font-semibold" placeholder="Airport T2" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Drop Location *</label>
                  <input required type="text" value={formData.dropLocation} onChange={e => setFormData({...formData, dropLocation: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 text-sm font-semibold" placeholder="Hotel Hyatt" />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Pickup Date & Time *</label>
                  <input required type="datetime-local" value={formData.pickupDateTime} onChange={e => setFormData({...formData, pickupDateTime: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 text-sm font-semibold cursor-pointer" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Drop Date & Time *</label>
                  <input required type="datetime-local" value={formData.dropDateTime} onChange={e => setFormData({...formData, dropDateTime: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 text-sm font-semibold cursor-pointer" />
                </div>
              </div>

              {/* Fare */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Total Ride Fare Amount (₹) *</label>
                <input required type="number" value={formData.fare} onChange={e => setFormData({...formData, fare: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 text-sm font-semibold" placeholder="2500" />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-xl transition-colors shadow-md">Publish Ride</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
            placeholder="Search rides by ID, customer, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchData} 
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-xl border border-gray-200 transition-colors"
          >
            <RefreshCw size={18} />
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-bold text-sm">
            <Plus size={18} />
            Publish New Ride
          </button>
        </div>
      </div>

      {/* Rides List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-medium">Loading ride dispatch list...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-medium bg-white rounded-2xl border border-gray-200">No rides matches found</div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow group relative flex flex-col lg:flex-row justify-between gap-6">
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                <button onClick={() => handleDelete(booking._id)} className="p-2 bg-white border border-gray-200 rounded-full shadow-sm text-red-600 hover:bg-red-50" title="Delete Booking"><Trash2 size={16} /></button>
              </div>

              <div className="flex-1">
                <div className="flex flex-col gap-1 mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">#{booking._id.substring(0, 8).toUpperCase()}</h3>
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Published: {new Date(booking.createdAt).toLocaleString()}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin size={18} className="text-indigo-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Pickup Location</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{booking.pickupLocation}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(booking.pickupDateTime).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="hidden sm:block w-px bg-gray-200"></div>
                  <div className="flex items-start gap-2">
                    <MapPin size={18} className="text-rose-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Dropoff Location</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{booking.dropLocation}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(booking.dropDateTime).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Customer Guest</p>
                  <p className="text-sm font-bold text-gray-900">{booking.customer ? booking.customer.name : 'Unknown'}</p>
                  {booking.customer && (
                    <p className="text-xs text-gray-500 mt-0.5">{booking.customer.phone} • {booking.customer.email}</p>
                  )}
                  
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 mt-4">Assigned Chauffeur</p>
                  <p className="text-sm font-bold text-gray-900">
                    {booking.driver ? booking.driver.name : <span className="text-gray-400 font-normal">Waiting for driver accept...</span>}
                  </p>
                  {booking.driver && (
                    <p className="text-xs text-gray-500 mt-0.5">{booking.driver.phone} • UPI ID: {booking.driver.upiId || 'N/A'}</p>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xl font-black text-emerald-600">₹{booking.fare}</span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <CreditCard size={14} className={booking.paymentStatus === 'Completed' ? 'text-emerald-500' : 'text-amber-500'} />
                    <span className={booking.paymentStatus === 'Completed' ? 'text-emerald-700' : 'text-amber-700'}>{booking.paymentStatus}</span>
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
