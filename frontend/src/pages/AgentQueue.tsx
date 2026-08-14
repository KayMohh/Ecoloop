import React, { useState, useEffect } from 'react';
import api from '../api';
import { Loader2, CheckCircle, Package } from 'lucide-react';

interface RequestItem {
  id: number;
  status: string;
  created_at: string;
  pickup_address: string;
  agent_id: number | null;
}

export default function AgentQueue() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: number, action: string, status?: string) => {
    try {
      if (action === 'assign') {
        await api.patch(`/requests/${id}/assign`);
      } else if (action === 'status' && status) {
        await api.patch(`/requests/${id}/status?new_status=${status}`);
      }
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-eco-green" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Collection Queue</h1>
      
      <div className="grid grid-cols-1 gap-4">
        {requests.map(req => (
          <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-bold text-lg text-eco-dark">Request #{req.id}</span>
                <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize border
                  ${req.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                    req.status === 'assigned' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                    'bg-green-50 text-green-700 border-green-200'}`}>
                  {req.status}
                </span>
              </div>
              <p className="text-gray-600 flex items-center gap-2">
                <Package size={16} /> {req.pickup_address}
              </p>
              <p className="text-xs text-gray-400 mt-1">Reported: {new Date(req.created_at).toLocaleString()}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {req.status === 'pending' && (
                <button onClick={() => handleAction(req.id, 'assign')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Accept Request
                </button>
              )}
              {req.status === 'assigned' && (
                <button onClick={() => handleAction(req.id, 'status', 'collected')} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2">
                  <CheckCircle size={16} /> Mark Collected
                </button>
              )}
              {req.status === 'collected' && (
                <>
                  <button onClick={() => handleAction(req.id, 'status', 'refurbished')} className="bg-eco-green text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium">
                    Log Refurbished
                  </button>
                  <button onClick={() => handleAction(req.id, 'status', 'recycled')} className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                    Log Recycled
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="text-center text-gray-500 py-10 bg-white rounded-2xl border">No requests in the queue.</div>
        )}
      </div>
    </div>
  );
}
