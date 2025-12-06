import React, { useState } from 'react';
import { X, Loader2, Calendar } from 'lucide-react';
import { SalesData } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface NewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SalesData) => void;
  existingLeads: string[];
  sdrs: string[];
  closers: string[];
}

export const NewMeetingModal: React.FC<NewMeetingModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  existingLeads,
  sdrs,
  closers 
}) => {
  const [loading, setLoading] = useState(false);
  
  const [selectedLead, setSelectedLead] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [selectedSdr, setSelectedSdr] = useState('');
  const [selectedCloser, setSelectedCloser] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !dateTime) return;
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const newMeeting: SalesData = {
      id: Math.random().toString(36).substr(2, 9),
      date: dateTime, // Stores full ISO string with time
      leadName: selectedLead,
      type: 'meeting_booked',
      outcome: 'scheduled',
      sdrName: selectedSdr || 'N/A',
      closerName: selectedCloser,
      notes: notes,
      leadStatus: 'Agendado'
    };

    onSave(newMeeting);
    setLoading(false);
    
    // Reset
    setSelectedLead('');
    setDateTime('');
    setSelectedSdr('');
    setSelectedCloser('');
    setNotes('');
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200 font-inter">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Agendar Reunião</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Lead Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Lead *</label>
            <select 
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-slate-700"
                value={selectedLead}
                onChange={e => setSelectedLead(e.target.value)}
                required
            >
                <option value="">Selecione o lead...</option>
                {existingLeads.map((lead, idx) => (
                    <option key={idx} value={lead}>{lead}</option>
                ))}
            </select>
          </div>

          {/* Data e Hora */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Data e Hora *</label>
            <div className="relative">
                <input 
                    type="datetime-local" 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-700 appearance-none bg-white"
                    value={dateTime}
                    onChange={e => setDateTime(e.target.value)}
                    required
                />
            </div>
          </div>

          {/* SDR & Closer Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">SDR</label>
                <select 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-slate-700"
                    value={selectedSdr}
                    onChange={e => setSelectedSdr(e.target.value)}
                >
                    <option value="">Selecione...</option>
                    {sdrs.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Closer</label>
                <select 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-slate-700"
                    value={selectedCloser}
                    onChange={e => setSelectedCloser(e.target.value)}
                >
                    <option value="">Selecione...</option>
                    {closers.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
             </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Observações</label>
            <textarea 
                rows={3}
                placeholder="Pauta, objetivos..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-slate-700"
                value={notes}
                onChange={e => setNotes(e.target.value)}
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading || !selectedLead || !dateTime}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Agendar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};