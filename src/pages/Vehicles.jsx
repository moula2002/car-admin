import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Car, RefreshCw, X } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Vehicles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/vehicle-types');
      setVehicleTypes(data.data);
    } catch (err) {
      toast.error('Failed to fetch vehicle types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle type?')) return;
    try {
      await api.delete(`/vehicle-types/${id}`);
      setVehicleTypes(vehicleTypes.filter(vt => vt._id !== id));
      toast.success('Vehicle type deleted successfully');
    } catch (err) {
      toast.error('Failed to delete vehicle type');
    }
  };

  const openEditModal = (vt) => {
    setEditingId(vt._id);
    setFormData({
      name: vt.name
    });
    setIsModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };

      if (editingId) {
        const { data } = await api.put(`/vehicle-types/${editingId}`, payload);
        setVehicleTypes(vehicleTypes.map(vt => vt._id === editingId ? data.data : vt));
        toast.success('Vehicle type updated successfully');
      } else {
        const { data } = await api.post('/vehicle-types', payload);
        setVehicleTypes([data.data, ...vehicleTypes]);
        toast.success('Vehicle type added successfully');
      }
      
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const filteredTypes = vehicleTypes.filter(vt => {
    const term = searchTerm.toLowerCase();
    return vt.name.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900">{editingId ? 'Edit Vehicle Type' : 'Add Vehicle Type'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle Type Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm font-semibold" placeholder="e.g. Sedan, SUV, Luxury" />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingId(null); }} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors text-sm">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm">{editingId ? 'Save Changes' : 'Add Vehicle Type'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Car size={24} />
            </div>
            Vehicle Types
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-2">Manage the categories of cars you offer for bookings.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search types..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100 text-sm font-medium transition-all"
            />
          </div>
          <button onClick={fetchData} className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors border border-gray-200">
            <RefreshCw size={18} />
          </button>
          <button onClick={() => { setFormData({ name: '' }); setIsModalOpen(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-sm font-bold text-sm hover:shadow hover:-translate-y-0.5">
            <Plus size={18} />
            Add Type
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-500 font-bold">Loading vehicle types...</div>
        ) : filteredTypes.length === 0 ? (
          <div className="text-center py-16 text-gray-500 font-bold bg-gray-50/50">No vehicle types found. Click 'Add Type' to create one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50/80 text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px]">Type Name</th>
                  <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTypes.map(vt => (
                  <tr key={vt._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Car size={18} />
                        </div>
                        <p className="font-bold text-gray-900 text-lg">{vt.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(vt)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Vehicle Type">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(vt._id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Vehicle Type">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vehicles;
