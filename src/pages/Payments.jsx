import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { CreditCard, Check, X, RefreshCw, ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';

export default function Payments() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actioningId, setActioningId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payments/transactions');
      setTransactions(response.data.data);
    } catch (err) {
      toast.error('Failed to load wallet transaction history.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActioningId(id);
    try {
      await api.put(`/payments/transactions/${id}/approve`);
      toast.success('Recharge transaction approved and balance credited!');
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve recharge request.');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id) => {
    setActioningId(id);
    try {
      await api.put(`/payments/transactions/${id}/reject`);
      toast.warning('Recharge transaction rejected.');
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject recharge request.');
    } finally {
      setActioningId(null);
    }
  };

  const pendingRecharges = transactions.filter(t => t.type === 'Recharge' && t.status === 'Pending');
  
  const allLogsFiltered = transactions.filter(t => {
    const driverName = t.driver?.name || '';
    const ref = t.transactionRef || '';
    const desc = t.description || '';
    const matchString = `${driverName} ${ref} ${desc}`.toLowerCase();
    return matchString.includes(searchTerm.toLowerCase());
  });

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <CreditCard size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Payments & Wallet Logs</h2>
            <p className="text-sm text-gray-500">Approve driver deposits and audit commission deductions.</p>
          </div>
        </div>
        <button 
          onClick={fetchTransactions} 
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      {/* Pending Recharges Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Pending Recharge Requests ({pendingRecharges.length})</h3>
        
        {pendingRecharges.length === 0 ? (
          <div className="bg-white border border-gray-200 p-8 rounded-2xl text-center text-gray-500 text-sm">
            No pending recharge verification requests at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRecharges.map(tx => (
              <div key={tx._id} className="bg-white border border-yellow-200 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="bg-yellow-50 border border-yellow-100 text-yellow-700 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full">
                      Awaiting Verification
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{formatDate(tx.createdAt)}</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Driver Partner</p>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">{tx.driver?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{tx.driver?.phone || ''}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">UTR/Ref No.</p>
                      <p className="text-xs text-gray-800 font-mono font-bold mt-0.5 select-all">{tx.transactionRef || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">UPI ID</p>
                      <p className="text-xs text-gray-800 font-bold mt-0.5">{tx.driver?.upiId || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {tx.paymentProof && (
                    <div className="pt-2">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Payment Proof</p>
                      <img 
                        src={tx.paymentProof.startsWith('data:') ? tx.paymentProof : `data:image/jpeg;base64,${tx.paymentProof}`} 
                        alt="Payment Proof" 
                        onClick={() => setSelectedImage(tx.paymentProof.startsWith('data:') ? tx.paymentProof : `data:image/jpeg;base64,${tx.paymentProof}`)}
                        className="h-16 w-16 md:h-20 md:w-20 rounded-xl border border-gray-200 object-cover cursor-pointer hover:opacity-80 transition-all shadow-sm" 
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  <span className="text-2xl font-black text-emerald-600">₹{tx.amount}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(tx._id)}
                      disabled={actioningId === tx._id}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 p-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                      title="Reject Request"
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={() => handleApprove(tx._id)}
                      disabled={actioningId === tx._id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                      title="Approve & Credit Balance"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction History Logs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Transaction Audit Ledger</h3>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search driver name or UTR..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-600 transition-all"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {allLogsFiltered.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No transaction records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Driver Partner</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Reference/Details</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allLogsFiltered.map((tx) => (
                    <tr key={tx._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-500 text-xs font-semibold">{formatDate(tx.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{tx.driver?.name || 'Deleted Driver'}</div>
                        <div className="text-xs text-gray-500">{tx.driver?.phone || ''}</div>
                      </td>
                      <td className="px-6 py-4">
                        {tx.type === 'Recharge' ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1.5"><ArrowUpRight size={14} /> Recharge</span>
                        ) : (
                          <span className="text-rose-600 font-bold flex items-center gap-1.5"><ArrowDownLeft size={14} /> Deduction</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs truncate max-w-[200px]" title={tx.transactionRef || tx.description}>
                        {tx.transactionRef || tx.description || 'N/A'}
                      </td>
                      <td className={`px-6 py-4 font-black text-right text-base ${
                        tx.type === 'Recharge' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {tx.type === 'Recharge' ? '+' : '-'}₹{tx.amount}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          tx.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          tx.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-3xl max-h-[90vh] w-full flex justify-center" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>
            <img src={selectedImage} alt="Payment Proof" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
          </div>
        </div>
      )}

    </div>
  );
}
