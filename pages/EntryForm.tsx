import React, { useState } from 'react';
import { SalesData, ActivityType, Outcome, ProductType, LeadSource } from '../types';
import { Save, AlertCircle, Settings as SettingsIcon, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EntryFormProps {
  onAdd: (entry: SalesData) => void;
  sdrs: string[];
  closers: string[];
}

export const EntryForm: React.FC<EntryFormProps> = ({ onAdd, sdrs, closers }) => {
  const [formData, setFormData] = useState<Partial<SalesData>>({
    date: new Date().toISOString().split('T')[0],
    leadName: '',
    type: 'call',
    outcome: 'connected',
    sdrName: sdrs.length > 0 ? sdrs[0] : '',
    closerName: '',
    product: 'SaaS Enterprise',
    leadSource: 'Outbound'
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.type || !formData.sdrName || !formData.leadName) return;

    const newEntry: SalesData = {
      id: Math.random().toString(36).substr(2, 9),
      date: formData.date,
      leadName: formData.leadName,
      type: formData.type as ActivityType,
      outcome: formData.outcome as Outcome,
      sdrName: formData.sdrName,
      closerName: formData.closerName,
      value: formData.value ? Number(formData.value) : undefined,
      product: formData.product,
      leadSource: formData.leadSource,
      notes: formData.notes
    };

    onAdd(newEntry);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    
    // Reset core fields but keep date/person/leadName for speed? No, reset leadName for new entry usually
    setFormData(prev => ({
        ...prev,
        leadName: '',
        value: 0,
        notes: ''
    }));
  };

  const renderOutcomeOptions = () => {
    switch(formData.type) {
      case 'call':
        return (
          <>
            <option value="connected">Atendida</option>
            <option value="no_answer">Não Atendida</option>
            <option value="gatekeeper">Gatekeeper</option>
          </>
        );
      case 'meeting_booked':
        return <option value="scheduled">Agendada</option>;
      case 'meeting_held':
        return (
          <>
            <option value="show">Realizada (Show)</option>
            <option value="no_show">No-Show</option>
            <option value="rescheduled">Reagendada</option>
          </>
        );
      case 'proposal':
        return (
          <>
            <option value="sent">Enviada</option>
            <option value="accepted">Aceita</option>
            <option value="rejected">Rejeitada</option>
          </>
        );
      case 'sale':
        return (
          <>
            <option value="closed_won">Ganha (Won)</option>
            <option value="closed_lost">Perdida (Lost)</option>
          </>
        );
      default: return null;
    }
  };

  // Warning if no team members are registered
  if (sdrs.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-yellow-50 border border-yellow-200 rounded-xl text-center shadow-sm">
        <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-yellow-800 mb-2">Configuração Pendente</h3>
        <p className="text-yellow-700 mb-6">
          Para inserir registros, você precisa primeiro cadastrar sua equipe (SDRs) no sistema.
        </p>
        <Link 
          to="/settings"
          className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md"
        >
          <SettingsIcon size={20} />
          Cadastrar Equipe
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
       <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Novo Registro de Atividade</h2>
        <p className="text-slate-500">Insira os dados da interação comercial para alimentar o BI.</p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Dados do Lead & Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Lead / Empresa</label>
                 <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Acme Corp, Tech Solutions Ltda..."
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={formData.leadName}
                      onChange={e => setFormData({...formData, leadName: e.target.value})}
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data da Atividade</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Interação</label>
                <select
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as ActivityType, outcome: undefined})}
                >
                  <option value="call">📞 Ligação (Cold Call)</option>
                  <option value="meeting_booked">📅 Agendamento</option>
                  <option value="meeting_held">🤝 Reunião / Demo</option>
                  <option value="proposal">📄 Proposta Comercial</option>
                  <option value="sale">💰 Fechamento (Venda)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Details */}
          <div className="space-y-4">
             <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Detalhes & Resultados</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resultado (Outcome)</label>
                <select
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  value={formData.outcome || ''}
                  onChange={e => setFormData({...formData, outcome: e.target.value as Outcome})}
                  required
                >
                  <option value="" disabled>Selecione o resultado...</option>
                  {renderOutcomeOptions()}
                </select>
              </div>

              {/* Show Product/Value for meaningful interactions */}
              {(formData.type === 'sale' || formData.type === 'proposal') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor do Deal (R$)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={formData.value || ''}
                      onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Produto / Serviço</label>
                    <select
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      value={formData.product || 'SaaS Enterprise'}
                      onChange={e => setFormData({...formData, product: e.target.value as ProductType})}
                    >
                      <option value="Consultoria">Consultoria</option>
                      <option value="SaaS Enterprise">SaaS Enterprise</option>
                      <option value="SaaS Basic">SaaS Basic</option>
                      <option value="Implementação">Implementação</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                </>
              )}

              {/* Show Lead Source for Calls/Meetings */}
              {['call', 'meeting_booked', 'meeting_held'].includes(formData.type || '') && (
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Origem do Lead</label>
                   <select
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      value={formData.leadSource || 'Outbound'}
                      onChange={e => setFormData({...formData, leadSource: e.target.value as LeadSource})}
                    >
                      <option value="Outbound">Outbound (Prospecção)</option>
                      <option value="Linkedin">Linkedin</option>
                      <option value="Google Ads">Google Ads</option>
                      <option value="Indicação">Indicação</option>
                      <option value="Eventos">Eventos</option>
                    </select>
                </div>
              )}
            </div>
          </div>

          {/* Section: Team */}
          <div className="space-y-4">
             <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Responsáveis</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SDR (Pré-vendas)</label>
                <select
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  value={formData.sdrName}
                  onChange={e => setFormData({...formData, sdrName: e.target.value})}
                >
                  {sdrs.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>

              {['meeting_held', 'proposal', 'sale'].includes(formData.type || '') && (
                 <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Closer (Vendedor)</label>
                 <select
                   className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                   value={formData.closerName}
                   onChange={e => setFormData({...formData, closerName: e.target.value})}
                 >
                   <option value="">Selecione...</option>
                   {closers.map(name => <option key={name} value={name}>{name}</option>)}
                 </select>
               </div>
              )}
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Observações Adicionais</label>
             <textarea
                rows={3}
                placeholder="Detalhes sobre a objeção, motivo do loss ou próximos passos..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                value={formData.notes || ''}
                onChange={e => setFormData({...formData, notes: e.target.value})}
             />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Salvar Atividade
            </button>
          </div>

          {success && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2 animate-pulse border border-green-200">
              <AlertCircle size={20} />
              Dados computados com sucesso!
            </div>
          )}

        </form>
      </div>
    </div>
  );
};