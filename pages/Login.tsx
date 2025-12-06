import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const success = await login(email, pass);
    if (success) {
      navigate('/');
    } else {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
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
          
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Bem-vindo de volta</h2>
          <p className="text-center text-slate-500 mb-8">Acesse seu painel de performance comercial</p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="flex justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Senha</label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">Esqueceu?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••"
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
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Entrar na Plataforma'}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Não tem uma conta?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Criar conta gratuita
              </Link>
            </p>
          </div>
        </div>
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-center gap-6">
            <span className="text-xs text-slate-400 font-medium">Privacidade</span>
            <span className="text-xs text-slate-400 font-medium">Termos</span>
            <span className="text-xs text-slate-400 font-medium">Ajuda</span>
        </div>
      </div>
    </div>
  );
};