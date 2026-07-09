import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User as UserIcon, Calendar, MapPin, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const DriverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchDriverData = async () => {
    try {
      const { data } = await api.get(`/drivers/${id}`);
      setDriver(data.data);
    } catch (err) {
      toast.error('Failed to load driver details');
      navigate('/drivers');
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverHistory = async () => {
    try {
      const { data } = await api.get(`/bookings?driver=${id}`);
      setHistory(data.data);
    } catch (err) {
      toast.error('Failed to load driver trips history');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
    fetchDriverHistory();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const { data } = await api.put(`/drivers/${id}`, { status: newStatus });
      setDriver(data.data);
      toast.success(`Driver status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update driver status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Ongoing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Arrived': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading driver details...</div>;
  }

  if (!driver) {
    return <div className="p-8 text-center text-gray-500 font-medium">Driver not found.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Toolbar */}
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
        <button onClick={() => navigate('/drivers')} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Driver Profile & Verification</h2>
        
        <div className="ml-auto flex items-center gap-3">
          {driver.status === 'pending' && (
            <>
              <button onClick={() => handleStatusChange('approved')} className="px-4 py-2 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
                <CheckCircle size={16} /> Approve
              </button>
              <button onClick={() => handleStatusChange('rejected')} className="px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2">
                <XCircle size={16} /> Reject
              </button>
            </>
          )}
          {driver.status === 'approved' && (
            <span className="px-4 py-2 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-bold shadow-sm">
              Approved Partner
            </span>
          )}
          {driver.status === 'rejected' && (
            <span className="px-4 py-2 bg-red-100 text-red-800 border border-red-200 rounded-xl text-sm font-bold shadow-sm">
              Rejected Application
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Basic Info Box */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 h-fit">
          <div className="flex items-center gap-4">
            {driver.photo ? (
              <img src={driver.photo} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-300 font-bold text-2xl uppercase">
                {driver.name.charAt(0)}
              </div>
            )}
            <div>
              <h4 className="text-xl font-bold text-gray-900">{driver.name}</h4>
              <p className="text-gray-500 text-sm">{driver.phone}</p>
              <p className="text-gray-500 text-sm truncate w-40">{driver.email}</p>
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-gray-100 text-sm">
            <div>
              <p className="text-gray-400 font-bold uppercase text-xs mb-0.5">UPI ID</p>
              <p className="font-semibold text-gray-900">{driver.upiId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase text-xs mb-0.5">Wallet Balance</p>
              <p className="font-bold text-indigo-600 text-lg">₹{driver.walletBalance || 0}</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase text-xs mb-0.5">Date of Birth</p>
              <p className="font-semibold text-gray-900">{driver.dob ? new Date(driver.dob).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase text-xs mb-0.5">Registered Date</p>
              <p className="font-semibold text-gray-900">{new Date(driver.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Verification Docs */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Verification Documents</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-gray-400 font-bold uppercase text-xs">DL Expiry</p>
              <p className="font-semibold text-gray-900 mt-1">{driver.dlExpiry ? new Date(driver.dlExpiry).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase text-xs">RC Expiry</p>
              <p className="font-semibold text-gray-900 mt-1">{driver.rcExpiry ? new Date(driver.rcExpiry).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase text-xs">PUC Expiry</p>
              <p className="font-semibold text-gray-900 mt-1">{driver.pucExpiry ? new Date(driver.pucExpiry).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase text-xs">Insurance Expiry</p>
              <p className="font-semibold text-gray-900 mt-1">{driver.insuranceExpiry ? new Date(driver.insuranceExpiry).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2 border-b pb-1">Driving License</h5>
              {driver.licenseImage ? (
                <a href={driver.licenseImage} target="_blank" rel="noreferrer">
                  <img src={driver.licenseImage} alt="License" className="w-full h-36 object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-opacity" />
                </a>
              ) : <div className="w-full h-36 bg-gray-50 rounded-xl flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-200 border-dashed">No Image Uploaded</div>}
            </div>

            <div>
              <h5 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2 border-b pb-1">Aadhaar Card</h5>
              {driver.aadhaarImage ? (
                <a href={driver.aadhaarImage} target="_blank" rel="noreferrer">
                  <img src={driver.aadhaarImage} alt="Aadhaar" className="w-full h-36 object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-opacity" />
                </a>
              ) : <div className="w-full h-36 bg-gray-50 rounded-xl flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-200 border-dashed">No Image Uploaded</div>}
            </div>

            <div>
              <h5 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2 border-b pb-1">Vehicle RC</h5>
              <p className="text-[10px] text-gray-500 mb-1 font-semibold uppercase">Plate: {driver.vehicleDetails?.number || 'N/A'}</p>
              {driver.vehicleDetails?.rcImage ? (
                <a href={driver.vehicleDetails.rcImage} target="_blank" rel="noreferrer">
                  <img src={driver.vehicleDetails.rcImage} alt="RC" className="w-full h-36 object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-opacity" />
                </a>
              ) : <div className="w-full h-36 bg-gray-50 rounded-xl flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-200 border-dashed">No Image Uploaded</div>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2 border-b pb-1">Vehicle PUC</h5>
                {driver.vehicleDetails?.pucImage ? (
                  <a href={driver.vehicleDetails.pucImage} target="_blank" rel="noreferrer">
                    <img src={driver.vehicleDetails.pucImage} alt="PUC" className="w-full h-36 object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-opacity" />
                  </a>
                ) : <div className="w-full h-36 bg-gray-50 rounded-xl flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-200 border-dashed">No Image</div>}
              </div>
              <div>
                <h5 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2 border-b pb-1">Insurance</h5>
                {driver.vehicleDetails?.insuranceImage ? (
                  <a href={driver.vehicleDetails.insuranceImage} target="_blank" rel="noreferrer">
                    <img src={driver.vehicleDetails.insuranceImage} alt="Insurance" className="w-full h-36 object-cover rounded-xl border border-gray-200 hover:opacity-90 transition-opacity" />
                  </a>
                ) : <div className="w-full h-36 bg-gray-50 rounded-xl flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-200 border-dashed">No Image</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ride History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Calendar size={20} className="text-indigo-600" /> Trip History
        </h3>

        {loadingHistory ? (
          <div className="py-8 text-center text-gray-500 font-medium">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-gray-500 font-medium bg-gray-50 rounded-xl border border-gray-100">No trips recorded for this driver yet.</div>
        ) : (
          <div className="space-y-4">
            {history.map((booking) => (
              <div key={booking._id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col md:flex-row justify-between gap-4">
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">#{booking._id.substring(0, 8).toUpperCase()}</h4>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 mt-3">
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-indigo-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Pickup</p>
                        <p className="text-xs font-semibold text-gray-900">{booking.pickupLocation}</p>
                        <p className="text-[10px] text-gray-400">{new Date(booking.pickupDateTime).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-rose-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Drop</p>
                        <p className="text-xs font-semibold text-gray-900">{booking.dropLocation}</p>
                        <p className="text-[10px] text-gray-400">{new Date(booking.dropDateTime).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4 min-w-[200px] flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-500">Customer</p>
                    <p className="text-xs font-bold text-gray-900">{booking.customer?.name || booking.customerName || 'Unknown'}</p>
                    <p className="text-[10px] text-gray-500">{booking.customer?.phone || booking.customerPhone}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-base font-black text-emerald-600">₹{booking.fare}</span>
                    <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                      <CreditCard size={12} className={booking.paymentStatus === 'Completed' ? 'text-emerald-500' : 'text-amber-500'} /> 
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default DriverDetails;
