import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, Activity, Zap } from 'lucide-react';
import OnboardingModal from '../components/OnboardingModal';

const data = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 5000 },
  { name: 'Thu', value: 4780 },
  { name: 'Fri', value: 5890 },
  { name: 'Sat', value: 4390 },
  { name: 'Sun', value: 6490 },
];

export default function Dashboard() {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('tour_completed')) {
      setShowTour(true);
    }
  }, []);

  const handleCloseTour = () => {
    localStorage.setItem('tour_completed', 'true');
    setShowTour(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
      {showTour && <OnboardingModal onClose={handleCloseTour} />}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-end pb-6 border-b border-white/10 gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Overview</h1>
            <p className="text-gray-400 mt-1">Welcome back. Here's what's happening today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-md transition-all text-sm font-medium shadow-sm">
              Download Report
            </button>
            <button className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-md transition-all text-sm font-medium shadow-sm">
              Create Project
            </button>
          </div>
        </header>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Total Revenue" 
            value="$45,231.89" 
            trend="+20.1%" 
            isPositive={true} 
            icon={<DollarSign className="w-5 h-5 text-gray-400" />} 
          />
          <MetricCard 
            title="Active Users" 
            value="2,350" 
            trend="+15.2%" 
            isPositive={true} 
            icon={<Users className="w-5 h-5 text-gray-400" />} 
          />
          <MetricCard 
            title="Active Sessions" 
            value="12,234" 
            trend="-4.5%" 
            isPositive={false} 
            icon={<Activity className="w-5 h-5 text-gray-400" />} 
          />
          <MetricCard 
            title="API Calls" 
            value="1.2M" 
            trend="+32.4%" 
            isPositive={true} 
            icon={<Zap className="w-5 h-5 text-gray-400" />} 
          />
        </div>

        {/* Chart Section */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="mb-6">
            <h2 className="text-lg font-medium text-white">Revenue Overview</h2>
            <p className="text-sm text-gray-400">Monthly revenue breakdown and trends</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#666" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  stroke="#666" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 12 }} 
                  dx={-10} 
                  tickFormatter={(value) => `$${value/1000}k`} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 500 }}
                  labelStyle={{ color: '#888', marginBottom: '4px' }}
                  cursor={{ stroke: '#333', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#fff" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 6, fill: '#000', stroke: '#fff', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, isPositive, icon }: { title: string, value: string, trend: string, isPositive: boolean, icon: React.ReactNode }) {
  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-6 flex flex-col justify-between hover:bg-[#161616] transition-colors shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] blur-3xl rounded-full translate-x-12 -translate-y-12 group-hover:bg-white/[0.04] transition-colors duration-500 pointer-events-none" />
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <div className="p-2 bg-white/[0.03] rounded-lg border border-white/5">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-semibold tracking-tight text-white mb-2">{value}</h3>
        <div className="flex items-center text-sm">
          <span className={`flex items-center font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
            {trend}
          </span>
          <span className="text-gray-500 ml-2">vs last month</span>
        </div>
      </div>
    </div>
  );
}
