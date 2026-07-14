import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, FileText, CheckCircle, XCircle, X, Eye, AlertCircle, Car, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Drivers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', dob: '', licenseNumber: '', aadhaar: '', panCard: '' });
  const navigate = useNavigate();

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/drivers');
      setDrivers(data.data);
    } catch (err) {
      toast.error('Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    try {
      await api.delete(`/drivers/${id}`);
      setDrivers(drivers.filter(d => d._id !== id));
      toast.success('Driver deleted successfully');
    } catch (err) {
      toast.error('Failed to delete driver');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { data } = await api.put(`/drivers/${id}`, { status: newStatus });
      setDrivers(drivers.map(d => d._id === id ? data.data : d));
      toast.success(`Driver status changed to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/drivers', formData);
      setDrivers([data.data, ...drivers]);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', phone: '', dob: '', licenseNumber: '', aadhaar: '', panCard: '' });
      toast.success('Driver added successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add driver');
    }
  };

  const filteredDrivers = drivers.filter(d =>
    d.status !== 'pending' &&
    ((d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.licenseNumber && d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="flex justify-between items-center p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
              <div>
                 <h3 className="text-xl font-bold text-slate-900">Add New Driver</h3>
                 <p className="text-xs text-slate-500 font-medium mt-1">Register a new driver profile to the platform</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors shadow-sm border border-slate-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 sm:p-8 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Full Name *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium" placeholder="Michael Scott" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Email Address *</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium" placeholder="michael@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Password *</label>
                  <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Phone Number *</label>
                  <input required type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium" placeholder="+91 9876543210" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Date of Birth</label>
                  <input type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium text-slate-700" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">License Number *</label>
                  <input required type="text" value={formData.licenseNumber} onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium uppercase placeholder:normal-case" placeholder="DL-1420110012345" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Aadhaar Number</label>
                  <input type="text" value={formData.aadhaar} onChange={e => setFormData({ ...formData, aadhaar: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium" placeholder="1234 5678 9012" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">PAN Card Number</label>
                  <input type="text" value={formData.panCard} onChange={e => setFormData({ ...formData, panCard: e.target.value })} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium uppercase placeholder:normal-case" placeholder="ABCDE1234F" />
                </div>
              </div>
              <div className="pt-6 mt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 hover:-translate-y-0.5">Save Driver Details</button>
              </div>
            </form>
          </div>
        </div>
      )}


      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-white shadow-sm">
        <div className="relative w-full sm:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl leading-5 bg-white/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all font-medium shadow-sm"
            placeholder="Search drivers by name or license..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center w-full sm:w-auto gap-2 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white px-6 py-3 rounded-2xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 font-bold shadow-md">
          <Plus size={20} />
          Add Driver
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/60">
            <thead className="bg-slate-50/80 backdrop-blur-sm">
              <tr>
                <th scope="col" className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Driver Info</th>
                <th scope="col" className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">License</th>
                <th scope="col" className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Assigned Car</th>
                <th scope="col" className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Joined Date</th>
                <th scope="col" className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th scope="col" className="relative px-6 py-5"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white/40 divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-16 text-slate-500 font-semibold animate-pulse">Loading active drivers...</td></tr>
              ) : filteredDrivers.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-16 text-slate-500 font-medium">No drivers found</td></tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-white/80 transition-colors group">
                    <td className="px-6 py-4 ">
                      <div className="flex items-center">
                        {driver.photo ? (
                          <img src={driver.photo} alt="" className="h-12 w-12 rounded-2xl object-cover border border-slate-200 shadow-sm group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="h-12 w-12 flex-shrink-0 rounded-2xl bg-gradient-to-tr from-amber-100 to-orange-50 border border-amber-100/50 flex items-center justify-center text-amber-600 font-black text-lg uppercase shadow-sm group-hover:scale-105 transition-transform">
                            {driver.name ? driver.name.charAt(0) : 'D'}
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">{driver.name || 'Unknown'}</div>
                          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">{driver.phone || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 ">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-slate-100 rounded-lg">
                           <FileText size={14} className="text-slate-500" />
                        </div>
                        <span className="text-sm text-slate-900 font-bold uppercase tracking-wide">{driver.licenseNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4  text-sm text-slate-500">
                      {driver.currentCar ? (
                        <div className="flex items-center gap-2">
                          <Car size={16} className="text-indigo-500"/>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{driver.currentCar.make} {driver.currentCar.model}</span>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-0.5">{driver.currentCar.registrationNumber}</span>
                          </div>
                        </div>
                      ) : driver.vehicleDetails?.number ? (
                        <div className="flex items-center gap-2">
                           <Car size={16} className="text-slate-400"/>
                           <div className="flex flex-col">
                             <span className="font-bold text-slate-700">{driver.vehicleDetails.type}</span>
                             <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-0.5">{driver.vehicleDetails.number}</span>
                           </div>
                        </div>
                      ) : (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-500 rounded-lg border border-slate-200/60">
                            Unassigned
                         </span>
                      )}
                    </td>
                    <td className="px-6 py-4 ">
                       <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                          <CalendarDays size={14} className="text-slate-400"/>
                          {new Date(driver.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                       </div>
                    </td>
                    <td className="px-6 py-4 ">
                      {driver.status === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200/60 shadow-sm shadow-emerald-100">
                          <CheckCircle size={14} /> Approved
                        </span>
                      )}
                      {driver.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200/60 shadow-sm shadow-rose-100">
                          <XCircle size={14} /> Rejected
                        </span>
                      )}
                      {driver.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200/60 shadow-sm shadow-amber-100">
                          <AlertCircle size={14} /> Pending
                        </span>
                      )}
                      {(driver.status === 'Active' || driver.status === 'Inactive') && (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm ${driver.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200/60 shadow-emerald-100' : 'bg-slate-100 text-slate-700 border border-slate-200/60'}`}>
                          {driver.status === 'Active' ? <CheckCircle size={14} /> : <XCircle size={14} />} {driver.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4  text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/drivers/${driver._id}`)} className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm text-blue-500 hover:bg-blue-50 hover:border-blue-200 transition-colors" title="View Details"><Eye size={16} /></button>
                        <button onClick={() => handleDelete(driver._id)} className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Drivers;
