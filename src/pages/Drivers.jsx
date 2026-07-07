import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, FileText, CheckCircle, XCircle, X, Eye, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Drivers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', dob: '', licenseNumber: '', aadhaar: '', panCard: '' });
  const [viewDriver, setViewDriver] = useState(null);

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
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Add New Driver</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Michael Scott" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="michael@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input required type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+91 9876543210" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <input required type="text" value={formData.licenseNumber} onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="DL-1420110012345" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
                  <input type="text" value={formData.aadhaar} onChange={e => setFormData({ ...formData, aadhaar: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="1234 5678 9012" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PAN Card Number</label>
                  <input type="text" value={formData.panCard} onChange={e => setFormData({ ...formData, panCard: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="ABCDE1234F" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-xl transition-colors shadow-sm">Save Driver</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDriver && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">Driver Verification Details</h3>
              <button onClick={() => setViewDriver(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                {viewDriver.photo ? (
                  <img src={viewDriver.photo} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-300 font-bold text-2xl uppercase">{viewDriver.name.charAt(0)}</div>
                )}
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{viewDriver.name}</h4>
                  <p className="text-gray-500 text-sm">{viewDriver.email} | {viewDriver.phone}</p>
                  <p className="text-gray-500 text-sm">DOB: {viewDriver.dob ? new Date(viewDriver.dob).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="ml-auto">
                  {viewDriver.status === 'pending' && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Pending Review</span>
                  )}
                  {viewDriver.status === 'approved' && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">Approved</span>
                  )}
                  {viewDriver.status === 'rejected' && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Rejected</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2 border-b pb-1">License ({viewDriver.licenseNumber})</h5>
                  {viewDriver.licenseImage ? (
                    <img src={viewDriver.licenseImage} alt="License" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                  ) : <div className="w-full h-32 bg-gray-50 rounded-lg flex items-center justify-center text-sm text-gray-400 border border-gray-200 border-dashed">No Image</div>}
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2 border-b pb-1">Aadhaar ({viewDriver.aadhaar || 'N/A'})</h5>
                  {viewDriver.aadhaarImage ? (
                    <img src={viewDriver.aadhaarImage} alt="Aadhaar" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                  ) : <div className="w-full h-32 bg-gray-50 rounded-lg flex items-center justify-center text-sm text-gray-400 border border-gray-200 border-dashed">No Image</div>}
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2 border-b pb-1">PAN Card ({viewDriver.panCard || 'N/A'})</h5>
                  {viewDriver.panImage ? (
                    <img src={viewDriver.panImage} alt="PAN Card" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                  ) : <div className="w-full h-32 bg-gray-50 rounded-lg flex items-center justify-center text-sm text-gray-400 border border-gray-200 border-dashed">No Image</div>}
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2 border-b pb-1">Vehicle RC ({viewDriver.vehicleDetails?.number || 'N/A'})</h5>
                  <p className="text-xs text-gray-500 mb-1">Type: {viewDriver.vehicleDetails?.type || 'N/A'}</p>
                  {viewDriver.vehicleDetails?.rcImage ? (
                    <img src={viewDriver.vehicleDetails.rcImage} alt="RC" className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                  ) : <div className="w-full h-24 bg-gray-50 rounded-lg flex items-center justify-center text-sm text-gray-400 border border-gray-200 border-dashed">No Image</div>}
                </div>
              </div>

              {viewDriver.status === 'pending' && (
                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <button onClick={() => { handleStatusChange(viewDriver._id, 'approved'); setViewDriver(null); }} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors">Approve Driver</button>
                  <button onClick={() => { handleStatusChange(viewDriver._id, 'rejected'); setViewDriver(null); }} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">Reject Application</button>
                </div>
              )}
            </div>
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
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium">
          <Plus size={20} />
          Add Driver
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Driver Info</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">License</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Car</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-10 text-gray-500 font-medium">Loading drivers...</td></tr>
              ) : filteredDrivers.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-10 text-gray-500 font-medium">No drivers found</td></tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {driver.photo ? (
                           <img src={driver.photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                            {driver.name.charAt(0)}
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                          <div className="text-sm text-gray-500">{driver.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-900 font-mono">{driver.licenseNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.currentCar ? (
                        <div className="flex flex-col">
                          <span>{driver.currentCar.make} {driver.currentCar.model}</span>
                          <span className="text-xs text-gray-400">{driver.currentCar.registrationNumber}</span>
                        </div>
                      ) : driver.vehicleDetails?.number ? (
                        <div className="flex flex-col">
                          <span>{driver.vehicleDetails.type}</span>
                          <span className="text-xs text-gray-400">{driver.vehicleDetails.number}</span>
                        </div>
                      ) : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(driver.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {driver.status === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-emerald-50 text-emerald-700">
                          <CheckCircle size={16} /> Approved
                        </span>
                      )}
                      {driver.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-red-50 text-red-700">
                          <XCircle size={16} /> Rejected
                        </span>
                      )}
                      {driver.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-yellow-50 text-yellow-700">
                          <AlertCircle size={16} /> Pending
                        </span>
                      )}
                      {(driver.status === 'Active' || driver.status === 'Inactive') && (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium ${driver.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                          {driver.status === 'Active' ? <CheckCircle size={16} /> : <XCircle size={16} />} {driver.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => setViewDriver(driver)} className="text-blue-600 hover:text-blue-900" title="View Details"><Eye size={18} /></button>
                        <button className="text-indigo-600 hover:text-indigo-900" title="Edit"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(driver._id)} className="text-red-600 hover:text-red-900" title="Delete"><Trash2 size={18} /></button>
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
