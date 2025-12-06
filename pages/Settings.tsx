import React, { useState } from 'react';
import { Trash2, Plus, User, Shield, Briefcase } from 'lucide-react';
import { TeamState } from '../types';

interface SettingsProps {
  onClear: () => void;
  team: TeamState;
  onUpdateTeam: (team: TeamState) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClear, team, onUpdateTeam }) => {
  const [newMember, setNewMember] = useState('');
  const [activeTab, setActiveTab] = useState<'sdrs' | 'closers' | 'admins'>('sdrs');

  const handleClear = () => {
    if (window.confirm("Tem certeza? Todos os dados serão apagados permanentemente.")) {
      onClear();
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.trim()) return;

    onUpdateTeam({
      ...team,
      [activeTab]: [...team[activeTab], newMember.trim()]
    });
    setNewMember('');
  };

  const handleRemoveMember = (name: string) => {
    if (window.confirm(`Remover "${name}" da lista?`)) {
      onUpdateTeam({
        ...team,
        [activeTab]: team[activeTab].filter(m => m !== name)
      });
    }
  };

  const tabs = [
    { id: 'sdrs', label: 'SDRs', icon: <User size={18} /> },
    { id: 'closers', label: 'Closers', icon: <Briefcase size={18} /> },
    { id: 'admins', label: 'Administradores', icon: <Shield size={18} /> },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Configurações</h2>
        <p className="text-slate-500">Gerencie sua equipe e dados do sistema.</p>
      </div>

      {/* Team Management Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">Gestão de Equipe</h3>
          <p className="text-slate-500 text-sm">Cadastre quem terá acesso e quem aparecerá nos relatórios.</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors relative ${
                activeTab === tab.id 
                  ? 'text-blue-600 bg-blue-50/50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          ))}
        </div>

        <div className="p-6 bg-slate-50/50 min-h-[300px]">
          {/* Add New Input */}
          <form onSubmit={handleAddMember} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              placeholder={`Nome do novo ${activeTab === 'admins' ? 'Administrador' : activeTab === 'sdrs' ? 'SDR' : 'Closer'}...`}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
              type="submit"
              disabled={!newMember.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              <Plus size={18} />
              Adicionar
            </button>
          </form>

          {/* List */}
          <div className="space-y-2">
            {team[activeTab].length === 0 ? (
              <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                Nenhum membro cadastrado nesta categoria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {team[activeTab].map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm group hover:border-blue-300 transition-colors">
                    <span className="font-medium text-slate-700">{member}</span>
                    <button
                      onClick={() => handleRemoveMember(member)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 text-red-600">Zona de Perigo</h3>
        <p className="text-slate-600 mb-6 text-sm">
          Ações irreversíveis para o banco de dados local.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleClear}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-medium transition-colors border border-red-200"
          >
            <Trash2 size={20} />
            Limpar Todos os Dados de Vendas
          </button>
        </div>
      </div>
    </div>
  );
};