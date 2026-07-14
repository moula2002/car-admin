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
    name: '',
    imageUrl: ''
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
      name: vt.name || '',
      imageUrl: vt.imageUrl || ''
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
      setFormData({ name: '', imageUrl: '' });
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
                <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm font-semibold" placeholder="e.g. Sedan, SUV, Luxury" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Upload Image (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({...formData, imageUrl: reader.result});
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm font-semibold" 
                />
                {formData.imageUrl && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={formData.imageUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-gray-200 shadow-sm" />
                    <span className="text-xs text-indigo-600 font-bold">Image ready</span>
                  </div>
                )}
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
          <button onClick={() => { setFormData({ name: '', imageUrl: '' }); setIsModalOpen(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-sm font-bold text-sm hover:shadow hover:-translate-y-0.5">
            <Plus size={18} />
            Add Type
          </button>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-16 text-gray-500 font-bold bg-white rounded-3xl shadow-sm border border-gray-100">Loading vehicle types...</div>
        ) : filteredTypes.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-500 font-bold bg-gray-50/50 rounded-3xl shadow-sm border border-gray-100">No vehicle types found. Click 'Add Type' to create one.</div>
        ) : (
          filteredTypes.map(vt => (
            <div key={vt._id} className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-indigo-50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="w-24 h-24 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 ring-4 ring-white shadow-sm group-hover:scale-110 transition-transform duration-300 relative z-10 overflow-hidden">
                {(vt.imageUrl || vt.image || vt.icon) ? (
                  <img src={vt.imageUrl || vt.image || vt.icon} alt={vt.name} className="w-full h-full object-cover" />
                ) : (
                  <Car size={32} />
                )}
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-6 relative z-10">{vt.name}</h3>
              
              <div className="flex items-center gap-2 mt-auto relative z-10 w-full justify-center border-t border-gray-50 pt-4">
                <button onClick={() => openEditModal(vt)} className="p-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors font-bold shadow-sm" title="Edit Type">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(vt._id)} className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors font-bold shadow-sm" title="Delete Type">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Vehicles;
