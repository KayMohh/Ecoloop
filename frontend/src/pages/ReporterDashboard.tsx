import React, { useState, useEffect } from 'react';
import api from '../api';
import { PlusCircle, Loader2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface RequestItem {
  id: number;
  status: string;
  created_at: string;
  pickup_address: string;
}

export default function ReporterDashboard() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [address, setAddress] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState('unknown');

  const fetchData = async () => {
    try {
      const [reqRes, catRes] = await Promise.all([
        api.get('/requests'),
        api.get('/categories')
      ]);
      setRequests(reqRes.data);
      setCategories(catRes.data);
      if (catRes.data.length > 0) setCategoryId(catRes.data[0].id.toString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/requests', {
        pickup_address: address,
        items: [{
          category_id: parseInt(categoryId),
          quantity: quantity,
          condition: condition
        }]
      });
      setShowForm(false);
      fetchData(); // Refresh list
    } catch (err) {
      console.error("Failed to submit", err);
    }
  };

  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-eco-green" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Requests</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-eco-green text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-600 transition-colors"
        >
          <PlusCircle size={20} />
          New Request
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Report E-Waste</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
              <input required value={address} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-eco-green outline-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-eco-green outline-none">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input type="number" min="1" required value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-eco-green outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-eco-green outline-none">
                  <option value="unknown">Unknown</option>
                  <option value="working">Working</option>
                  <option value="broken">Broken</option>
                </select>
              </div>
            </div>
            <button type="submit" className="bg-eco-dark text-white px-6 py-2 rounded-lg hover:bg-green-900 transition-colors">Submit</button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-medium text-gray-600">ID</th>
              <th className="p-4 font-medium text-gray-600">Date</th>
              <th className="p-4 font-medium text-gray-600">Address</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No requests found.</td></tr>
            ) : (
              requests.map(req => (
                <tr key={req.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 text-gray-800">#{req.id}</td>
                  <td className="p-4 text-gray-600">{new Date(req.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-gray-600">{req.pickup_address}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize 
                      ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        req.status === 'assigned' ? 'bg-blue-100 text-blue-800' : 
                        req.status === 'collected' ? 'bg-purple-100 text-purple-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
