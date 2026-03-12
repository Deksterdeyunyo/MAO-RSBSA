import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';

interface Distribution {
  id: string;
  recipient_id: string;
  inventory_id: string;
  quantity: number;
  date_distributed: string;
  remarks: string;
  recipients: {
    first_name: string;
    last_name: string;
    rsbsa_number: string;
  };
  inventory: {
    name: string;
    type: string;
    unit: string;
  };
}

export const Distribution: React.FC = () => {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // For dropdowns
  const [recipients, setRecipients] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    recipient_id: '',
    inventory_id: '',
    quantity: 0,
    date_distributed: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  const fetchData = async () => {
    setLoading(true);
    const [distRes, recRes, invRes] = await Promise.all([
      supabase
        .from('distributions')
        .select(`
          *,
          recipients (first_name, last_name, rsbsa_number),
          inventory (name, type, unit)
        `)
        .order('date_distributed', { ascending: false }),
      supabase.from('recipients').select('id, first_name, last_name, rsbsa_number').order('last_name'),
      supabase.from('inventory').select('id, name, type, quantity, unit').gt('quantity', 0).order('name')
    ]);

    if (distRes.error) console.error('Error fetching distributions:', distRes.error);
    else setDistributions(distRes.data as any || []);

    if (recRes.data) setRecipients(recRes.data);
    if (invRes.data) setInventory(invRes.data);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      recipient_id: '',
      inventory_id: '',
      quantity: 0,
      date_distributed: new Date().toISOString().split('T')[0],
      remarks: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check inventory quantity
    const selectedItem = inventory.find(i => i.id === formData.inventory_id);
    if (selectedItem && formData.quantity > selectedItem.quantity) {
      alert(`Cannot distribute more than available stock (${selectedItem.quantity} ${selectedItem.unit}).`);
      return;
    }

    const { error } = await supabase
      .from('distributions')
      .insert([formData]);
      
    if (!error) {
      fetchData();
      setIsModalOpen(false);
    } else {
      alert('Error recording distribution: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record? Note: This will NOT restore inventory quantity automatically.')) {
      const { error } = await supabase.from('distributions').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  const filteredDistributions = distributions.filter(item => {
    const searchLower = search.toLowerCase();
    return (
      item.recipients?.last_name.toLowerCase().includes(searchLower) ||
      item.recipients?.first_name.toLowerCase().includes(searchLower) ||
      item.recipients?.rsbsa_number.toLowerCase().includes(searchLower) ||
      item.inventory?.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Distribution</h1>
        <button
          onClick={handleOpenModal}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Record Distribution
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search distributions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Recipient</th>
                <th className="px-6 py-4 font-medium">Item</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Remarks</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredDistributions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No distribution records found.</td>
                </tr>
              ) : (
                filteredDistributions.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                      {format(new Date(item.date_distributed), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.recipients?.last_name}, {item.recipients?.first_name}</div>
                      <div className="text-xs text-gray-500">{item.recipients?.rsbsa_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.inventory?.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{item.inventory?.type.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.quantity} {item.inventory?.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.remarks || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 transition-colors">
                        <Trash2 className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">Record Distribution</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
                <select
                  required
                  value={formData.recipient_id}
                  onChange={(e) => setFormData({ ...formData, recipient_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Recipient</option>
                  {recipients.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.last_name}, {r.first_name} ({r.rsbsa_number})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item to Distribute</label>
                <select
                  required
                  value={formData.inventory_id}
                  onChange={(e) => setFormData({ ...formData, inventory_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Item</option>
                  {inventory.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} - Available: {i.quantity} {i.unit}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date_distributed}
                    onChange={(e) => setFormData({ ...formData, date_distributed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={2}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
