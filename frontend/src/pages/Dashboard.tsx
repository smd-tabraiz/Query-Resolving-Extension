import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, Brain, TrendingUp, BookOpen, Clock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f87171'];

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    api.get('/queries/analytics').then(res => setStats(res.data));
    api.get('/queries/history').then(res => setHistory(res.data.slice(0, 5)));
  }, []);

  const categoryData = stats?.categories?.map((c: any) => ({
    name: c.category || 'Unknown',
    value: c.count
  })) || [];

  const activityData = [
    { day: 'Mon', count: 4 },
    { day: 'Tue', count: 7 },
    { day: 'Wed', count: 5 },
    { day: 'Thu', count: 12 },
    { day: 'Fri', count: 9 },
    { day: 'Sat', count: 15 },
    { day: 'Sun', count: 10 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Intelligence Hub</h1>
          <p className="text-slate-400 mt-2 text-lg">Your search patterns, analyzed by AI.</p>
        </div>
        <div className="bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700 flex items-center gap-2 text-sm text-slate-300">
          <Clock className="w-4 h-4 text-sky-400" />
          Last updated: Just now
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total searches', value: stats?.totalSearches || 0, icon: Search, color: 'from-blue-600 to-sky-400' },
          { title: 'Categories', value: stats?.categories?.length || 0, icon: Brain, color: 'from-purple-600 to-indigo-400' },
          { title: 'AI Insights', value: history.length, icon: TrendingUp, color: 'from-emerald-600 to-teal-400' },
          { title: 'Engines Used', value: 4, icon: Globe, color: 'from-amber-600 to-orange-400' },
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-3xl bg-[#1e293b] border border-slate-800 relative overflow-hidden group hover:border-slate-600 transition-all shadow-xl"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.color} opacity-5 blur-3xl group-hover:opacity-10 transition-opacity`} />
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${item.color} w-fit mb-4 shadow-lg shadow-sky-500/10`}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-slate-400 text-sm font-medium">{item.title}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{item.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-[#1e293b] border border-slate-800 shadow-2xl">
          <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Weekly Search Activity
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Line type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={4} dot={{ fill: '#38bdf8', r: 6 }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-8 rounded-3xl bg-[#1e293b] border border-slate-800 shadow-2xl">
          <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            Category Mix
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData.length > 0 ? categoryData : [{ name: 'Empty', value: 1 }]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  {categoryData.length === 0 && <Cell fill="#334155" />}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.slice(0, 3).map((c, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-400">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {c.name}
                </span>
                <span className="text-white font-semibold">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent AI Recommendations */}
      <div className="p-8 rounded-3xl bg-[#1e293b] border border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            Personalized Learning Path
          </h2>
          <button className="text-sky-400 hover:text-sky-300 text-sm font-medium">View all</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {item.category || 'Learning'}
                </span>
                <span className="text-slate-500 text-xs">• {new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
              <p className="text-white font-medium mb-2 line-clamp-1">"{item.query}"</p>
              <p className="text-slate-400 text-xs leading-relaxed italic">
                {item.Recommendation?.content || 'Analyzing intent for better recommendations...'}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
