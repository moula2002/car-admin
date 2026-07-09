import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { Settings as SettingsIcon, Save, RefreshCw, QrCode } from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingId, setSettingId] = useState(null);
  const [adminUpiId, setAdminUpiId] = useState('');
  const [commissionPerRide, setCommissionPerRide] = useState(100);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/settings');
      const data = response.data.data;
      if (data && data.length > 0) {
        setSettingId(data[0]._id);
        setAdminUpiId(data[0].adminUpiId || '');
        setCommissionPerRide(data[0].commissionPerRide || 100);
      }
    } catch (err) {
      toast.error('Failed to load administrative settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (settingId) {
        // Update existing setting
        await api.put(`/settings/${settingId}`, {
          adminUpiId,
          commissionPerRide: Number(commissionPerRide)
        });
      } else {
        // Create settings
        const response = await api.post('/settings', {
          adminUpiId,
          commissionPerRide: Number(commissionPerRide)
        });
        setSettingId(response.data.data._id);
      }
      toast.success('System settings saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">System Settings</h2>
          <p className="text-sm text-gray-500">Configure global taxi rules, wallet criteria, and payment destinations.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="grid grid-cols-1 gap-6">
            
            {/* UPI ID */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Admin UPI ID</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. company@upi"
                  value={adminUpiId}
                  onChange={(e) => setAdminUpiId(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 transition-all text-sm font-semibold text-gray-950"
                  required
                />
                <QrCode size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Drivers will send wallet recharge payments directly to this UPI destination address.
              </p>
            </div>

            {/* Commission Amount */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Per-Ride Commission (₹)</label>
              <input
                type="number"
                placeholder="100"
                value={commissionPerRide}
                onChange={(e) => setCommissionPerRide(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 transition-all text-sm font-semibold text-gray-950"
                min="0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This exact amount will be automatically deducted from a driver's wallet balance upon completed bookings.
              </p>
            </div>

          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl text-sm flex items-center gap-2 shadow-md hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
