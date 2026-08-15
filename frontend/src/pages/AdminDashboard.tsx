import { useState, useEffect } from 'react';
import api from '../api';
import { Loader2, TrendingUp, RefreshCw, Box } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Stats {
  total_collected: number;
  refurbished_count: number;
  recycled_count: number;
  refurbished_percentage: number;
  recycled_percentage: number;
  estimated_waste_diverted_kg: number;
}

const COLORS = ['#10b981', '#6b7280'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-eco-green" /></div>;
  if (!stats) return <div className="text-center text-red-500 mt-20">Failed to load stats.</div>;

  const chartData = [
    { name: 'Refurbished', value: stats.refurbished_count },
    { name: 'Recycled', value: stats.recycled_count },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">System Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600"><Box size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Items Collected</p>
            <p className="text-3xl font-bold text-gray-800">{stats.total_collected}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-xl text-green-600"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Waste Diverted (kg)</p>
            <p className="text-3xl font-bold text-gray-800">{stats.estimated_waste_diverted_kg.toFixed(1)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-purple-100 p-4 rounded-xl text-purple-600"><RefreshCw size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Refurbish Rate</p>
            <p className="text-3xl font-bold text-gray-800">{stats.refurbished_percentage.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Outcomes</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
