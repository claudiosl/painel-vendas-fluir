import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { SalesData, LeadSource } from '../types';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SalesData) => void;
  sdrs: string[];
  closers: string[];
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({ isOpen, onClose, onSave, sdrs, closers }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    empresa: '',
    contato: '',
    email: '',
    telefone: '',
    canal: 'Inbound' as LeadSource,
    status: 'Novo',
    valorEstimado: '',
    sdr: '',
    closer: '',
    observacoes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate network delay for UX
    await new Promise(r => setTimeout(r, 600));

    const newLead: SalesData = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      leadName: formData.empresa,
      contactName: formData.contato,
      email: formData.email,
      phone: formData.telefone,
      leadSource: formData.canal,
      leadStatus: formData.status,
      value: formData.valorEstimado ? parseFloat(formData.valorEstimado) : 0,
      sdrName: formData.sdr,
      closerName: formData.closer,
      notes: formData.observacoes,
      type: 'lead_created',
      outcome: 'new' // Internal outcome mapping
    };

    onSave(newLead);
    setLoading(false);
    onClose();
    
    // Reset form
    setFormData({
      empresa: '',
      contato: '',
      email: '',
      telefone: '',
      canal: 'Inbound',
      status: 'Novo',
      valorEstimado: '',
      sdr: '',
      closer: '',
      observacoes: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Novo Lead</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Empresa */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Empresa *</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.empresa}
                onChange={e => setFormData({...formData, empresa: e.target.value})}
              />
            </div>

            {/* Contato */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contato *</label>
              <input 
                type="text" 
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.contato}
                onChange={e => setFormData({...formData, contato: e.target.value})}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Telefone</label>
              <input 
                type="tel" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.telefone}
                onChange={e => setFormData({...formData, telefone: e.target.value})}
              />
            </div>

            {/* Canal */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Canal</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                value={formData.canal}
                onChange={e => setFormData({...formData, canal: e.target.value as LeadSource})}
              >
                <option value="Inbound">Inbound</option>
                <option value="Outbound">Outbound</option>
                <option value="Linkedin">Linkedin</option>
                <option value="Indicação">Indicação</option>
                <option value="Eventos">Eventos</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="Novo">Novo</option>
                <option value="Em Qualificação">Em Qualificação</option>
                <option value="Agendado">Agendado</option>
                <option value="Negociação">Negociação</option>
              </select>
            </div>

            {/* Valor Estimado */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Valor Estimado</label>
              <input 
                type="number" 
                placeholder="R$ 0,00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.valorEstimado}
                onChange={e => setFormData({...formData, valorEstimado: e.target.value})}
              />
            </div>

            {/* SDR */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">SDR Responsável</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                value={formData.sdr}
                onChange={e => setFormData({...formData, sdr: e.target.value})}
              >
                <option value="">Selecione...</option>
                {sdrs.map(sdr => <option key={sdr} value={sdr}>{sdr}</option>)}
              </select>
            </div>
            
            {/* Closer (Full width on small screens, or span-2 depending on design, visual implies simple grid flow) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Closer Responsável</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                value={formData.closer}
                onChange={e => setFormData({...formData, closer: e.target.value})}
              >
                <option value="">Selecione...</option>
                {closers.map(closer => <option key={closer} value={closer}>{closer}</option>)}
              </select>
            </div>

            {/* Observações */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Observações</label>
              <textarea 
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                value={formData.observacoes}
                onChange={e => setFormData({...formData, observacoes: e.target.value})}
              ></textarea>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading || !formData.empresa || !formData.contato}
              className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Criar Lead
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};