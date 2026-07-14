import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, MapPin, Mail, Phone } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', location: '' });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers');
      setCustomers(data.data);
    } catch (err) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      setCustomers(customers.filter(c => c._id !== id));
      toast.success('Customer deleted successfully');
    } catch (err) {
      toast.error('Failed to delete customer');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/customers', formData);
      setCustomers([data.data, ...customers]);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', location: '' });
      toast.success('Customer added successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add customer');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                 <h3 className="text-xl font-bold text-slate-900">Add Customer</h3>
                 <p className="text-xs text-slate-500 font-medium mt-1">Register a new rider manually</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors shadow-sm border border-slate-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Full Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Email Address</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Phone Number *</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium" placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Default Location</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium" placeholder="Downtown, NY" />
              </div>
              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 hover:-translate-y-0.5">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-white shadow-sm">
        <div className="relative w-full sm:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl leading-5 bg-white/80 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all font-medium shadow-sm"
            placeholder="Search customers by name, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center w-full sm:w-auto gap-2 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white px-6 py-3 rounded-2xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 font-bold shadow-md">
          <Plus size={20} />
          Add Customer
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200/60">
            <thead className="bg-slate-50/80 backdrop-blur-sm">
              <tr>
                <th scope="col" className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Customer</th>
                <th scope="col" className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Contact</th>
                <th scope="col" className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Location</th>
                <th scope="col" className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Member Since</th>
                <th scope="col" className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th scope="col" className="relative px-6 py-5"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white/40 divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-16 text-slate-500 font-semibold animate-pulse">Loading amazing customers...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-16 text-slate-500 font-medium">No customers found</td></tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-white/80 transition-colors group">
                    <td className="px-6 py-4 ">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0 rounded-2xl bg-gradient-to-tr from-indigo-100 to-indigo-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600 font-black text-lg uppercase shadow-sm group-hover:scale-105 transition-transform">
                          {customer.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">{customer.name}</div>
                          <div className="text-[11px] font-semibold text-slate-400 mt-0.5">ID: {customer._id.substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 ">
                      <div className="flex flex-col gap-1.5">
                         <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Mail size={14} className="text-slate-400" /> {customer.email || 'N/A'}
                         </div>
                         <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Phone size={14} className="text-slate-400" /> {customer.phone}
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 ">
                       <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg inline-flex border border-slate-100">
                          <MapPin size={14} className="text-indigo-400" />
                          {customer.location || 'Not Provided'}
                       </div>
                    </td>
                    <td className="px-6 py-4  text-sm font-medium text-slate-500">
                      {new Date(customer.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 ">
                      <span className="px-3 py-1 inline-flex text-[11px] tracking-wider font-black rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200/60 shadow-sm shadow-emerald-100">
                        ACTIVE
                      </span>
                    </td>
                    <td className="px-6 py-4  text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleDelete(customer._id)} className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors"><Trash2 size={16} /></button>
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

export default Customers;
