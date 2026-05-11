import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, BarChart3, PieChart as PieIcon, ShieldCheck, Activity, Mail, Send, X, MessageSquare, FileText, Paperclip, CheckCircle, Sparkles, Trash2, Search, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL);
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f87171'];

const AdminAnalytics = () => {
  const [data, setData] = useState<any>(null);
  const [globalHistory, setGlobalHistory] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState<number | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [shareForm, setShareForm] = useState({ email: '', message: '' });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    api.get('/queries/global-analytics').then(res => setData(res.data));
    api.get('/queries/global-history').then(res => {
      setGlobalHistory(res.data);
    });
    api.get('/queries/clusters').then(res => setClusters(res.data));
    api.get('/queries/trends').then(res => setTrends(res.data));

    socket.on('newQuery', (newQuery) => {
      setGlobalHistory(prev => [newQuery, ...prev].slice(0, 50));
      setData((prev: any) => prev ? ({ ...prev, totalQueries: prev.totalQueries + 1 }) : prev);
      
      // Refetch trends and clusters to keep charts fully real-time
      api.get('/queries/trends').then(res => setTrends(res.data));
      api.get('/queries/clusters').then(res => setClusters(res.data));
    });

    return () => {
      socket.off('newQuery');
    };
  }, []);

  const openShareModal = (item: any) => {
    setSelectedQuery(item);
    setShareForm({ email: (item.User || item.user)?.email || '', message: '' });
    setSelectedFiles([]);
    setShowSuccess(false);
    setIsModalOpen(true);
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    const formData = new FormData();
    formData.append('queryId', selectedQuery.id);
    formData.append('recipientEmail', shareForm.email);
    formData.append('customMessage', shareForm.message);
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      await api.post('/queries/share-query', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Instantly update status locally without needing a page refresh
      setGlobalHistory(prev => prev.map(item => 
        item.id === selectedQuery.id ? { ...item, status: 'resolved' } : item
      ));

      setShowSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
      }, 2000);
    } catch (err) {
      alert('Failed to send email.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setQueryToDelete(id);
  };

  const confirmDelete = async () => {
    if (queryToDelete === null) return;
    try {
      await api.delete(`/queries/${queryToDelete}`);
      setGlobalHistory(prev => prev.filter(item => item.id !== queryToDelete));
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
    } catch (error) {
      alert('Failed to delete query');
    } finally {
      setQueryToDelete(null);
    }
  };

  const handleUserClick = async (user: any) => {
    setSelectedUser(user);
    const res = await api.get(`/queries/user-analytics/${user.id}`);
    setUserStats(res.data);
  };

  const categoryData = data?.trendingCategories?.map((c: any) => ({
    name: c.category || 'General',
    value: c.count
  })) || [];

  const engineData = data?.engineStats?.map((e: any) => ({
    name: e.engine,
    value: e.count
  })) || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const filteredHistory = globalHistory.filter(item => {
    const matchesSearch = item.query.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (item.User || item.user)?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(globalHistory.map(item => item.category)))];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-sky-500/10 rounded-2xl">
            <ShieldCheck className="w-8 h-8 text-sky-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Admin Control Center</h1>
            <p className="text-slate-400">Real-time system oversight and user intelligence.</p>
          </div>
        </div>

        {/* AI Intelligence Summary */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">AI Intelligence Summary</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {clusters.length > 0 ? clusters.map((cluster, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                  <Activity className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-white font-bold mb-2">{cluster.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{cluster.summary}</p>
              </motion.div>
            )) : (
              <div className="col-span-full p-8 text-center bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                <p className="text-slate-500 italic">Gathering intelligence from recent searches...</p>
              </div>
            )}
          </div>
        </div>

      </header>

      {/* Activity Peak Trends */}
      <div className="mb-12 p-8 bg-[#1e293b] border border-slate-800 rounded-[2.5rem] shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-400" />
              Activity Peak Trends
            </h2>
            <p className="text-slate-500 text-sm">Hourly search volume over the last 24 hours.</p>
          </div>
          <div className="px-4 py-2 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400 text-xs font-bold uppercase tracking-widest">
            Last 24 Hours
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#0ea5e9', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#0ea5e9" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorCount)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Total Users', value: data?.totalUsers || 0, icon: Users, color: 'from-blue-600 to-sky-400' },
          { title: 'Global Queries', value: data?.totalQueries || 0, icon: Activity, color: 'from-rose-600 to-pink-400' },
          { title: 'Active Categorization', value: '98.4%', icon: BarChart3, color: 'from-emerald-600 to-teal-400' },
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl bg-[#1e293b] border border-slate-800 shadow-2xl relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-5 blur-3xl`} />
            <item.icon className="w-8 h-8 text-white mb-4" />
            <p className="text-slate-400 font-medium">{item.title}</p>
            <h3 className="text-4xl font-black text-white mt-2 tracking-tighter">{item.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Global Trending Categories */}
        <div className="p-8 rounded-3xl bg-[#1e293b] border border-slate-800">
          <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-sky-400" />
            Trending Topics (Global)
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                />
                <Bar dataKey="value" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engine Distribution */}
        <div className="p-8 rounded-3xl bg-[#1e293b] border border-slate-800">
          <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Search Engine Market Share
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={engineData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {engineData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Global Activity Feed */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-800 bg-[#1e293b]/50 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-sky-500/10 rounded-2xl">
                <Activity className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Recent Global Activity</h2>
                <p className="text-slate-500 text-sm">Real-time search feed from all users.</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-sky-400 transition-colors w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search user or query..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 w-full sm:w-64 transition-all"
                />
              </div>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/50 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Search Query</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Engine</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredHistory.length > 0 ? filteredHistory.map((item, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors group animate-in slide-in-from-left duration-300" style={{ animationDelay: `${i * 0.05}s` }}>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleUserClick(item.User || item.user)}
                      className="flex flex-col text-left hover:opacity-80 transition-opacity"
                    >
                      <span className="text-white font-medium group-hover:text-sky-400 transition-colors">{(item.User || item.user)?.username || 'Anonymous'}</span>
                      <span className="text-slate-500 text-xs">{(item.User || item.user)?.email || 'No email'}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-300 italic group-hover:text-white transition-colors">"{item.query}"</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-sky-400 font-medium border border-slate-700">
                      {item.category || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm capitalize">
                      <div className={`w-1.5 h-1.5 rounded-full ${item.engine === 'google' ? 'bg-blue-400' : 'bg-green-400'}`} />
                      {item.engine}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.status === 'resolved' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openShareModal(item)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-slate-400 hover:text-sky-400 transition-all border border-slate-700 border-transparent hover:border-sky-500/30"
                        title="Send report with custom note"
                      >
                        <Mail className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(item.id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all border border-slate-700 border-transparent hover:border-red-500/30"
                        title="Delete Query Globally"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-slate-700 mb-2" />
                      <p className="text-slate-500 italic">No results match your current search criteria.</p>
                      <button 
                        onClick={() => { setSearchQuery(''); setFilterCategory('All'); }}
                        className="text-sky-400 text-xs font-bold uppercase hover:underline mt-2"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creative Share Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#1e293b] border border-slate-700 rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="absolute top-0 right-0 p-6 z-10">
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-10 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                  {!showSuccess ? (
                    <motion.div 
                      key="form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20">
                          <Send className="w-8 h-8 text-sky-400" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">Share Intelligence</h2>
                          <p className="text-slate-400 text-sm">Send a detailed report to the user.</p>
                        </div>
                      </div>

                      <form onSubmit={handleShareSubmit} className="space-y-6">
                        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 mb-6">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Target Query</p>
                          <p className="text-white font-medium italic">"{selectedQuery?.query}"</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300 ml-1">Recipient Email</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                            <input 
                              type="email" 
                              required 
                              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500" 
                              value={shareForm.email}
                              onChange={e => setShareForm({...shareForm, email: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300 ml-1">Add Expert Advice</label>
                          <div className="relative">
                            <MessageSquare className="absolute left-4 top-4 text-slate-500 w-5 h-5" />
                            <textarea 
                              rows={3}
                              placeholder="Type your insights or recommended resources here..."
                              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" 
                              value={shareForm.message}
                              onChange={e => setShareForm({...shareForm, message: e.target.value})}
                            />
                          </div>
                        </div>

                        {/* File Upload Section */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-slate-300 ml-1">Attachments (Docs, PDFs, Images)</label>
                          <div className="grid grid-cols-1 gap-2">
                            {selectedFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <FileText className="w-5 h-5 text-sky-400 shrink-0" />
                                  <span className="text-sm text-slate-200 truncate">{file.name}</span>
                                  <span className="text-[10px] text-slate-500 font-mono uppercase">{(file.size / 1024).toFixed(0)}KB</span>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                                  className="text-slate-500 hover:text-red-400 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            
                            <label className="relative flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-sky-500/50 hover:bg-sky-500/5 transition-all group overflow-hidden">
                              <Paperclip className="w-5 h-5 text-slate-500 group-hover:text-sky-400" />
                              <span className="text-sm text-slate-500 group-hover:text-slate-300">Click to attach files</span>
                              <input 
                                type="file" 
                                multiple 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                onChange={e => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                                    e.target.value = ''; // Reset to allow selecting the same file again
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        <button 
                          disabled={isSending}
                          type="submit" 
                          className="w-full py-4 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 group"
                        >
                          {isSending ? 'Sending Resources...' : 'Send Analysis & Files'}
                          {!isSending && <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                        </button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-20 text-center"
                    >
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                        className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6"
                      >
                        <CheckCircle className="w-12 h-12 text-emerald-400" />
                      </motion.div>
                      <h2 className="text-3xl font-black text-white mb-2">Share Successful!</h2>
                      <p className="text-slate-400">The intelligence report has been dispatched.</p>
                      <div className="mt-8 flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Profile Deep-Dive Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-[#1e293b] border border-slate-700 rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="absolute top-0 right-0 p-6 z-10">
                <button onClick={() => setSelectedUser(null)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-10 overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-20 h-20 rounded-3xl bg-sky-500 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-sky-500/20">
                    {selectedUser.username?.[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">{selectedUser.username}'s Intelligence Profile</h2>
                    <p className="text-slate-400 font-medium">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="p-8 bg-slate-900/50 rounded-[2rem] border border-slate-800">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                      <PieIcon className="w-5 h-5 text-sky-400" />
                      Interest Distribution
                    </h3>
                    <div className="h-64">
                      {userStats ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={userStats.categoryStats}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {userStats.categoryStats.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                              itemStyle={{ color: '#fff' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-500 italic">Analyzing interests...</div>
                      )}
                    </div>
                  </div>

                  <div className="p-8 bg-slate-900/50 rounded-[2rem] border border-slate-800">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-rose-400" />
                      Recent Activity Journey
                    </h3>
                    <div className="space-y-4">
                      {userStats?.recentQueries.map((q: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                          <div className="w-2 h-2 rounded-full bg-sky-500" />
                          <div className="flex-1">
                            <p className="text-sm text-white font-medium truncate">"{q.query}"</p>
                            <p className="text-[10px] text-slate-500">{new Date(q.timestamp).toLocaleString()}</p>
                          </div>
                          <span className="text-[10px] px-2 py-1 bg-slate-700 rounded-md text-slate-300">{q.engine}</span>
                        </div>
                      )) || (
                        <div className="text-center py-10 text-slate-500">No recent activity.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center py-4 border-t border-slate-800">
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">End of intelligence report</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {queryToDelete !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQueryToDelete(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#1e293b] border border-slate-700 rounded-[2rem] shadow-2xl p-8 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Delete Query Globally?</h3>
              <p className="text-slate-400 text-sm mb-8">This action cannot be undone. This will permanently remove this record from the global history for all users.</p>
              
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setQueryToDelete(null)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors border border-slate-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 bg-slate-900 border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 rounded-2xl p-4 flex items-center gap-4 z-50"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-bold">Query Deleted</p>
              <p className="text-slate-400 text-sm">The search record has been permanently removed.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAnalytics;
