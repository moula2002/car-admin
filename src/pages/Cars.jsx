import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Car as CarIcon, MapPin, X } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Cars = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ make: '', model: '', registrationNumber: '', type: 'Sedan' });

  const fetchCars = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/cars');
      setCars(data.data);
    } catch (err) {
      toast.error('Failed to fetch cars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;
    try {
      await api.delete(`/cars/${id}`);
      setCars(cars.filter(c => c._id !== id));
      toast.success('Car deleted successfully');
    } catch (err) {
      toast.error('Failed to delete car');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/cars', formData);
      setCars([data.data, ...cars]);
      setIsModalOpen(false);
      setFormData({ make: '', model: '', registrationNumber: '', type: 'Sedan' });
      toast.success('Car added successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add car');
    }
  };

  const filteredCars = cars.filter(c => 
    c.make.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'bg-emerald-100 text-emerald-800';
      case 'Booked': return 'bg-blue-100 text-blue-800';
      case 'Maintenance': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Add New Car</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                  <input required type="text" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Toyota" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input required type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Camry" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                <input required type="text" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="MH01 AB 1234" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Car Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-xl transition-colors shadow-sm">Save Car</button>
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
            placeholder="Search cars by make, model or registration..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium">
          <Plus size={20} />
          Add Car
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-10 text-gray-500 font-medium">Loading cars...</div>
      ) : filteredCars.length === 0 ? (
        <div className="text-center py-10 text-gray-500 font-medium">No cars found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <div key={car._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button className="p-2 bg-white rounded-full shadow-sm text-indigo-600 hover:bg-indigo-50"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(car._id)} className="p-2 bg-white rounded-full shadow-sm text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
              </div>
              
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <CarIcon size={24} />
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(car.status)}`}>
                  {car.status}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1">{car.make} {car.model}</h3>
              <p className="text-sm font-medium text-gray-500 mb-4">{car.type} • {car.registrationNumber}</p>
              
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="text-gray-400" />
                  <span>Driver: <strong>{car.currentDriver ? car.currentDriver.name : 'Unassigned'}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cars;
