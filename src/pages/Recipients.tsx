import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

interface Recipient {
  id: string;
  rsbsa_number: string;
  first_name: string;
  last_name: string;
  barangay: string;
  contact_number: string;
}

export const Recipients: React.FC = () => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Recipient | null>(null);
  
  const [formData, setFormData] = useState({
    rsbsa_number: '',
    first_name: '',
    last_name: '',
    barangay: '',
    contact_number: '',
  });

  const fetchRecipients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('recipients')
      .select('*')
      .order('last_name');
    
    if (error) {
      console.error('Error fetching recipients:', error);
    } else {
      setRecipients(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecipients();
  }, []);

  const handleOpenModal = (item?: Recipient) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        rsbsa_number: item.rsbsa_number,
        first_name: item.first_name,
        last_name: item.last_name,
        barangay: item.barangay,
        contact_number: item.contact_number || '',
      });
    } else {
      setEditingItem(null);
      setFormData({ rsbsa_number: '', first_name: '', last_name: '', barangay: '', contact_number: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      const { error } = await supabase
        .from('recipients')
        .update(formData)
        .eq('id', editingItem.id);
      if (!error) {
        fetchRecipients();
        setIsModalOpen(false);
      } else {
        alert('Error updating recipient: ' + error.message);
      }
    } else {
      const { error } = await supabase
        .from('recipients')
        .insert([formData]);
      if (!error) {
        fetchRecipients();
        setIsModalOpen(false);
      } else {
        alert('Error adding recipient: ' + error.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this recipient?')) {
      const { error } = await supabase.from('recipients').delete().eq('id', id);
      if (!error) fetchRecipients();
    }
  };

  const filteredRecipients = recipients.filter(item => 
    item.rsbsa_number.toLowerCase().includes(search.toLowerCase()) || 
    item.first_name.toLowerCase().includes(search.toLowerCase()) ||
    item.last_name.toLowerCase().includes(search.toLowerCase()) ||
    item.barangay.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Recipients</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Recipient
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipients..."
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
                <th className="px-6 py-4 font-medium">RSBSA No.</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Barangay</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredRecipients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No recipients found.</td>
                </tr>
              ) : (
                filteredRecipients.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.rsbsa_number}</td>
                    <td className="px-6 py-4 text-gray-900">{item.last_name}, {item.first_name}</td>
                    <td className="px-6 py-4 text-gray-500">{item.barangay}</td>
                    <td className="px-6 py-4 text-gray-500">{item.contact_number || '-'}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleOpenModal(item)} className="text-blue-600 hover:text-blue-800 transition-colors">
                        <Pencil className="w-5 h-5 inline" />
                      </button>
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
              <h2 className="text-xl font-semibold text-gray-800">
                {editingItem ? 'Edit Recipient' : 'Add New Recipient'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RSBSA Number</label>
                <input
                  type="text"
                  required
                  value={formData.rsbsa_number}
                  onChange={(e) => setFormData({ ...formData, rsbsa_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                <input
                  type="text"
                  required
                  value={formData.barangay}
                  onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  {editingItem ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
