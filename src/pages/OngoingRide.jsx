import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, CreditCard, RefreshCw, Check, X } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const RideCard = ({ booking, getStatusColor, onReject }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isAcceptedLocally, setIsAcceptedLocally] = useState(false);
  const [isRejectedLocally, setIsRejectedLocally] = useState(false);
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

  useEffect(() => {
    if (isExpired && booking.status === 'Pending' && !isAcceptedLocally && !isRejectedLocally) {
      const autoReject = async () => {
        try {
          await api.put(`/bookings/${booking._id}`, { status: 'Cancelled' });
          toast.info(`Ride #${booking._id.substring(0, 8).toUpperCase()} automatically rejected due to timeout.`);
          setIsRejectedLocally(true);
          if (onReject) onReject(booking._id);
        } catch (err) {
          console.error('Failed to auto-reject ride');
        }
      };
      autoReject();
    }
  }, [isExpired, booking.status, isAcceptedLocally, isRejectedLocally, booking._id, onReject]);

  const handleAccept = async () => {
    try {
      await api.put(`/bookings/${booking._id}`, { status: 'Admin Accepted' });
      setIsAcceptedLocally(true);
      toast.success('Ride accepted successfully!');
    } catch (err) {
      toast.error('Failed to update status in MongoDB.');
    }
  };

  const handleReject = async () => {
    try {
      await api.put(`/bookings/${booking._id}`, { status: 'Cancelled' });
      toast.info('Ride rejected successfully.');
      setIsRejectedLocally(true);
      if (onReject) onReject(booking._id);
    } catch (err) {
      toast.error('Failed to reject ride in MongoDB.');
    }
  };

  const formatTime = (ms) => {
    if (ms <= 0) return 'Expired';
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((ms % (1000 * 60)) / 1000);
    return `${mins}m ${secs}s`;
  };

  const showButtons = booking.timer && booking.startTime && !isExpired && booking.status === 'Pending';

  // Display logic: "Until the timer expires, the ride should remain in a pending state."
  let displayStatus = booking.status;
  if (isRejectedLocally) {
    displayStatus = 'Cancelled';
  } else if (isAcceptedLocally && !isExpired) {
    displayStatus = 'Pending (Accepted Website)';
  } else if (isAcceptedLocally && isExpired) {
    displayStatus = 'Admin Accepted';
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60 hover:shadow-md transition-shadow flex flex-col lg:flex-row justify-between gap-6">
      <div className="flex-1">
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900">#{booking._id.substring(0, 8).toUpperCase()}</h3>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(displayStatus.includes('Pending') ? 'Pending' : displayStatus)}`}>
              {displayStatus}
            </span>
            {booking.timer && !isExpired && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border flex items-center gap-1 bg-blue-50 text-blue-600 border-blue-200">
                <Clock size={12} /> {timeLeft !== null ? formatTime(timeLeft) : `${booking.timer} mins`}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">Published: {new Date(booking.createdAt).toLocaleString()}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 mb-4">
          <div className="flex items-start gap-2">
            <MapPin size={18} className="text-indigo-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Pickup Location</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{booking.pickupLocation}</p>
            </div>
          </div>
          <div className="hidden sm:block w-px bg-gray-200"></div>
          <div className="flex items-start gap-2">
            <MapPin size={18} className="text-rose-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Dropoff Location</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{booking.dropLocation}</p>
            </div>
          </div>
        </div>

        {/* Actions section */}
        {showButtons && !isAcceptedLocally && !isRejectedLocally && (
          <div className="mt-4 flex gap-3 animate-in fade-in">
            <button onClick={handleAccept} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
              <Check size={16} /> Accept Ride
            </button>
            <button onClick={handleReject} className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 text-sm font-bold rounded-xl hover:bg-rose-100 transition-colors shadow-sm">
              <X size={16} /> Reject
            </button>
          </div>
        )}
      </div>

      <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-between">
        <div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Customer</p>
          <p className="text-sm font-bold text-gray-900">{booking.customer?.name || 'Unknown'}</p>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 mt-4">Driver</p>
          <p className="text-sm font-bold text-gray-900">{booking.driver?.name || 'Not Assigned'}</p>
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
  );
};

const OngoingRide = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings');
      // Filter for active/ongoing rides (exclude Completed and Cancelled)
      const ongoing = res.data.data.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled');
      setBookings(ongoing);
    } catch (err) {
      toast.error('Failed to fetch ongoing rides.');
    } finally {
      setLoading(false);
    }
  };

  const handleRideRejected = (bookingId) => {
    setBookings(prev => prev.filter(b => b._id !== bookingId));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ongoing': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Arrived': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'Accepted': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Admin Accepted': return 'bg-teal-100 text-teal-800 border border-teal-200';
      case 'Pending': return 'bg-amber-100 text-amber-800 border border-amber-200';
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
            placeholder="Search active rides..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={fetchData}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-xl border border-gray-200 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-medium">Loading ongoing rides...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-medium bg-white rounded-2xl border border-gray-200">No ongoing rides found</div>
        ) : (
          filteredBookings.map((booking) => (
            <RideCard key={booking._id} booking={booking} getStatusColor={getStatusColor} onReject={handleRideRejected} />
          ))
        )}
      </div>
    </div>
  );
};

export default OngoingRide;
