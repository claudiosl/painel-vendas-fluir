import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { EntryForm } from './pages/EntryForm';
import { DataList } from './pages/DataList';
import { LeadsList } from './pages/LeadsList';
import { FinancialDashboard } from './pages/FinancialDashboard';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { SalesData, TeamState } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const DATA_STORAGE_KEY = 'sales_optima_data_v1';
const TEAM_STORAGE_KEY = 'sales_optima_team_v1';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-[#f8fafc] text-slate-500">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout>{children}</Layout>;
};

const MainApp: React.FC = () => {
  // Global Data State
  const [data, setData] = useState<SalesData[]>([]);
  const [team, setTeam] = useState<TeamState>({
    sdrs: ['SDR Inicial'],
    closers: ['Closer Inicial'],
    admins: ['Admin Principal']
  });
  const [loading, setLoading] = useState(true);

  // Load from LocalStorage
  useEffect(() => {
    const savedData = localStorage.getItem(DATA_STORAGE_KEY);
    if (savedData) {
      try { setData(JSON.parse(savedData)); } 
      catch (e) { setData([]); }
    }

    const savedTeam = localStorage.getItem(TEAM_STORAGE_KEY);
    if (savedTeam) {
      try { setTeam(JSON.parse(savedTeam)); } 
      catch (e) { console.error(e); }
    }
    setLoading(false);
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(team));
    }
  }, [data, team, loading]);

  const handleAdd = (entry: SalesData) => setData(prev => [entry, ...prev]);
  const handleImport = (newEntries: SalesData[]) => setData(prev => [...newEntries, ...prev]);
  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      setData(prev => prev.filter(item => item.id !== id));
    }
  };
  const handleClear = () => setData([]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Dashboard data={data} onImport={handleImport} /></ProtectedRoute>} />
      <Route path="/add" element={<ProtectedRoute><EntryForm onAdd={handleAdd} sdrs={team.sdrs} closers={team.closers} /></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute><LeadsList data={data} onAdd={handleAdd} sdrs={team.sdrs} closers={team.closers} /></ProtectedRoute>} />
      <Route path="/financial" element={<ProtectedRoute><FinancialDashboard /></ProtectedRoute>} />
      <Route path="/data" element={<ProtectedRoute><DataList data={data} onDelete={handleDelete} /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings onClear={handleClear} team={team} onUpdateTeam={setTeam} /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <MainApp />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;