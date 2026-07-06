import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, FileText, CheckCircle, XCircle, X } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Drivers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', licenseNumber: '' });

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

  const handleStatusToggle = async (driver) => {
    const newStatus = driver.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const { data } = await api.put(`/drivers/${driver._id}`, { status: newStatus });
      setDrivers(drivers.map(d => d._id === driver._id ? data.data : d));
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
      setFormData({ name: '', phone: '', licenseNumber: '' });
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
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Add New Driver</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Michael Scott" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input required type="text" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="DL12345678" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-xl transition-colors shadow-sm">Save Driver</button>
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
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-10 text-gray-500 font-medium">Loading drivers...</td></tr>
              ) : filteredDrivers.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 text-gray-500 font-medium">No drivers found</td></tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                          {driver.name.charAt(0)}
                        </div>
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
                      {driver.currentCar ? `${driver.currentCar.make} ${driver.currentCar.model}` : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleStatusToggle(driver)}
                        className="flex items-center gap-1.5 focus:outline-none hover:bg-gray-100 px-2 py-1 rounded-md transition-colors"
                      >
                        {driver.status === 'Active' ? (
                          <CheckCircle size={16} className="text-emerald-500" />
                        ) : (
                          <XCircle size={16} className="text-gray-400" />
                        )}
                        <span className={`text-sm font-medium ${
                          driver.status === 'Active' ? 'text-emerald-700' : 'text-gray-600'
                        }`}>
                          {driver.status}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button className="text-indigo-600 hover:text-indigo-900"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(driver._id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
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
