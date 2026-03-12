import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sprout, FlaskConical, Syringe, Bug, Users, Truck } from 'lucide-react';

interface DashboardStats {
  totalSeeds: number;
  totalFertilizers: number;
  totalVetChemicals: number;
  totalPesticides: number;
  totalRecipients: number;
  totalDistributions: number;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSeeds: 0,
    totalFertilizers: 0,
    totalVetChemicals: 0,
    totalPesticides: 0,
    totalRecipients: 0,
    totalDistributions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          { count: seedsCount },
          { count: fertCount },
          { count: vetCount },
          { count: pestCount },
          { count: recCount },
          { count: distCount }
        ] = await Promise.all([
          supabase.from('inventory').select('*', { count: 'exact', head: true }).eq('type', 'seeds'),
          supabase.from('inventory').select('*', { count: 'exact', head: true }).eq('type', 'fertilizers'),
          supabase.from('inventory').select('*', { count: 'exact', head: true }).eq('type', 'vet_chemicals'),
          supabase.from('inventory').select('*', { count: 'exact', head: true }).eq('type', 'pesticides'),
          supabase.from('recipients').select('*', { count: 'exact', head: true }),
          supabase.from('distributions').select('*', { count: 'exact', head: true }),
        ]);

        setStats({
          totalSeeds: seedsCount || 0,
          totalFertilizers: fertCount || 0,
          totalVetChemicals: vetCount || 0,
          totalPesticides: pestCount || 0,
          totalRecipients: recCount || 0,
          totalDistributions: distCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartData = [
    { name: 'Seeds', value: stats.totalSeeds },
    { name: 'Fertilizers', value: stats.totalFertilizers },
    { name: 'Vet & Chemicals', value: stats.totalVetChemicals },
    { name: 'Pesticides', value: stats.totalPesticides },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Seeds Inventory" value={stats.totalSeeds} icon={Sprout} color="bg-emerald-100 text-emerald-600" />
        <StatCard title="Fertilizers Inventory" value={stats.totalFertilizers} icon={FlaskConical} color="bg-blue-100 text-blue-600" />
        <StatCard title="Vet & Chemicals" value={stats.totalVetChemicals} icon={Syringe} color="bg-purple-100 text-purple-600" />
        <StatCard title="Pesticides" value={stats.totalPesticides} icon={Bug} color="bg-red-100 text-red-600" />
        <StatCard title="Total Recipients" value={stats.totalRecipients} icon={Users} color="bg-orange-100 text-orange-600" />
        <StatCard title="Total Distributions" value={stats.totalDistributions} icon={Truck} color="bg-teal-100 text-teal-600" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Inventory Overview</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`p-4 rounded-lg ${color}`}>
      <Icon className="w-8 h-8" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);
