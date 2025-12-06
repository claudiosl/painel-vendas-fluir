import React, { useState } from 'react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, Lock, Mail, User, Loader2, ArrowRight, Briefcase } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [role, setRole] = useState<UserRole>('sdr');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (pass.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    setIsSubmitting(true);
    
    const success = await register(name, email, pass, role);
    if (success) {
      navigate('/');
    } else {
      setError('Este e-mail já está cadastrado.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-inter p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Crie sua conta</h2>
          <p className="text-center text-slate-500 mb-8">Defina seu cargo e comece a operar</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome Completo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="João Silva"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail corporativo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Função / Cargo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <select
                  required
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white appearance-none cursor-pointer"
                >
                    <option value="sdr">SDR (Pré-vendas)</option>
                    <option value="closer">Closer (Vendas)</option>
                    <option value="admin">Administrador</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="Mínimo 6 caracteres"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 text-center animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Criar Conta'}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Já possui uma conta?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};