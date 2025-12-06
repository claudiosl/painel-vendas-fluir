import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Target, 
  Phone, 
  Calendar, 
  FileText, 
  Users, 
  TrendingUp, 
  Settings, 
  LogOut,
  DollarSign
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinkClass = (path: string, search?: string) => {
    const isActive = location.pathname === path && (!search || location.search.includes(search));
    return `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium group ${
      isActive
        ? 'bg-emerald-50 text-emerald-600 shadow-sm'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`;
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-inter">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col z-30 flex-shrink-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
        <div className="p-6">
          <div className="flex items-center gap-3 select-none">
            {/* Logo Icon mimicking the green arrow shape */}
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-600/20 text-white transform -rotate-3">
              <TrendingUp className="w-6 h-6" strokeWidth={3} />
            </div>
            {/* Text Logo */}
            <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase leading-none tracking-widest mb-0.5">Agência</span>
                <span className="block text-2xl font-black text-slate-900 leading-none tracking-tight">Fluir</span>
            </div>
          </div>
        </div>

        <div className="px-3 py-2 flex-1 overflow-y-auto custom-scrollbar">
          <nav className="space-y-1.5">
            <NavLink to="/" className={getLinkClass('/')}>
              <LayoutDashboard size={20} className={location.pathname === '/' ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/leads" className={getLinkClass('/leads')}>
              <Target size={20} className={location.pathname === '/leads' ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'} />
              <span>Leads</span>
            </NavLink>
            <NavLink to="/financial" className={getLinkClass('/financial')}>
              <DollarSign size={20} className={location.pathname === '/financial' ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'} />
              <span>Financeiro</span>
            </NavLink>
            
            <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Gestão
            </div>
            
            <NavLink to="/data?type=call" className={getLinkClass('/data', 'type=call')}>
              <Phone size={20} className="text-slate-400 group-hover:text-slate-600" />
              <span>Atividades</span>
            </NavLink>
            <NavLink to="/data?type=meeting_held" className={getLinkClass('/data', 'type=meeting_held')}>
              <Calendar size={20} className="text-slate-400 group-hover:text-slate-600" />
              <span>Reuniões</span>
            </NavLink>
            <NavLink to="/data?type=proposal" className={getLinkClass('/data', 'type=proposal')}>
              <FileText size={20} className="text-slate-400 group-hover:text-slate-600" />
              <span>Propostas</span>
            </NavLink>
             <NavLink to="/data?type=sale" className={getLinkClass('/data', 'type=sale')}>
              <TrendingUp size={20} className="text-slate-400 group-hover:text-slate-600" />
              <span>Vendas</span>
            </NavLink>
            
             <div className="pt-6 pb-2 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Sistema
            </div>

            <NavLink to="/settings" className={getLinkClass('/settings')}>
              <Users size={20} className={location.pathname === '/settings' ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'} />
              <span>Equipe</span>
            </NavLink>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
           <NavLink to="/settings" className={getLinkClass('/settings')}>
              <Settings size={20} className="text-slate-400 group-hover:text-slate-600" />
              <span>Configurações</span>
           </NavLink>
           
           <div className="mt-4 flex items-center gap-3 px-3 py-3 bg-slate-50 rounded-xl border border-slate-200/60 group cursor-default">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-200 text-sm">
               {user?.name.charAt(0).toUpperCase() || 'U'}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'Usuário'}</p>
               <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@sistema.com'}</p>
             </div>
           </div>
           
           <button 
            onClick={handleLogout}
            className="w-full mt-2 flex items-center justify-center gap-2 text-slate-400 hover:text-red-600 text-xs font-medium py-2 transition-colors hover:bg-red-50 rounded-lg"
           >
              <LogOut size={14} />
              Sair da Conta
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative bg-[#f8fafc]">
        <div className="max-w-[1600px] mx-auto p-6 md:p-8 animate-in fade-in duration-300">
          {children}
        </div>
      </main>
    </div>
  );
};