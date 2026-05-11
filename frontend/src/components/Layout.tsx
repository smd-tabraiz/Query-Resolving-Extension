import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, History, PieChart, LogOut, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 flex flex-col p-6 bg-[#1e293b] h-full overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 text-sky-400 font-bold text-xl mb-12">
          <Search className="w-8 h-8" />
          <span>SmartSearch</span>
        </div>

        <nav className="flex-1 space-y-4">
          <Link to="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-sky-400" />
            Dashboard
          </Link>
          <Link to="/history" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
            <History className="w-5 h-5 text-sky-400" />
            History
          </Link>
          {user?.role === 'ADMIN' && (
            <Link to="/analytics" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
              <PieChart className="w-5 h-5 text-sky-400" />
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-3">
            <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/20">
              {user?.username?.[0].toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-white">{user?.username}</span>
              <span className="text-[10px] uppercase font-bold text-sky-400 tracking-widest">{user?.role}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-900/20 text-red-400 transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-[#0f172a]">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
