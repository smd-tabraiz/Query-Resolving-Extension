import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search as SearchIcon, ExternalLink, BrainCircuit, Mail, Trash2, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const History = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState<number | null>(null);

  const fetchHistory = () => {
    api.get('/queries/history').then(res => setHistory(res.data));
  };

  const handleDeleteClick = (id: number) => {
    setQueryToDelete(id);
  };

  const confirmDelete = async () => {
    if (queryToDelete === null) return;
    try {
      await api.delete(`/queries/${queryToDelete}`);
      setHistory(history.filter(item => item.id !== queryToDelete));
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
    } catch (error) {
      alert('Failed to delete query');
    } finally {
      setQueryToDelete(null);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => 
    item.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Search History</h1>
          <p className="text-slate-400">Review your past searches and AI insights.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchHistory}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 text-sm"
          >
            Refresh Data
          </button>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Filter queries..." 
              className="pl-10 pr-4 py-2 bg-[#1e293b] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Query</th>
              <th className="px-6 py-4 font-medium">Engine</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredHistory.map((item) => (
              <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-medium text-white max-w-xs truncate">{item.query}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded bg-slate-700 text-xs text-slate-300 uppercase">
                    {item.engine}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-2 text-sky-400 text-sm">
                    <BrainCircuit className="w-4 h-4" />
                    {item.category || 'Analyzing...'}
                  </span>
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
                <td className="px-6 py-4 text-slate-400 text-sm">
                  {new Date(item.timestamp).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors" title="Open Search">
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    {user?.role === 'ADMIN' && (
                      <button 
                        onClick={() => {
                          const email = prompt('Enter recipient email:');
                          if (email) {
                            api.post('/queries/share-query', { queryId: item.id, recipientEmail: email })
                              .then(() => alert('Email shared successfully!'))
                              .catch(() => alert('Failed to share email.'));
                          }
                        }}
                        className="text-sky-500 hover:text-sky-400 transition-colors"
                        title="Share via Email"
                      >
                        <Mail className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteClick(item.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete Query"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
              <h3 className="text-2xl font-black text-white mb-2">Delete Query?</h3>
              <p className="text-slate-400 text-sm mb-8">This action cannot be undone. This will permanently remove this record from your history.</p>
              
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

export default History;
