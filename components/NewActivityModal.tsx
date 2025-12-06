import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { SalesData, ActivityType } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface NewActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SalesData) => void;
  existingLeads: string[]; // List of lead names to populate dropdown
}

export const NewActivityModal: React.FC<NewActivityModalProps> = ({ isOpen, onClose, onSave, existingLeads }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [selectedLead, setSelectedLead] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('call');
  const [isAnswered, setIsAnswered] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    // Logic to determine outcome based on "Atendida?" toggle
    // If it's a call: Answered = connected, Not Answered = no_answer
    // This is a simplification based on the UI provided.
    let outcome = 'no_answer';
    if (activityType === 'call') {
        outcome = isAnswered ? 'connected' : 'no_answer';
    } else if (activityType === 'meeting_held') {
        outcome = isAnswered ? 'show' : 'no_show';
    } else {
        outcome = 'connected'; // Default for other types
    }

    const newActivity: SalesData = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      leadName: selectedLead,
      type: activityType,
      outcome: outcome as any,
      duration: duration,
      notes: description,
      sdrName: user?.name || 'SDR Atual', // Assign to current user
      leadStatus: 'Working' // Implicitly moves lead to working
    };

    onSave(newActivity);
    setLoading(false);
    
    // Reset
    setSelectedLead('');
    setActivityType('call');
    setIsAnswered(false);
    setDuration(0);
    setDescription('');
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200 font-inter">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Registrar Atividade</h2>
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

          {/* Activity Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de Atividade *</label>
            <select 
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-slate-700"
                value={activityType}
                onChange={e => setActivityType(e.target.value as ActivityType)}
            >
                <option value="call">Ligação</option>
                <option value="meeting_booked">Agendamento</option>
                <option value="meeting_held">Reunião Realizada</option>
                <option value="proposal">Envio de Proposta</option>
            </select>
          </div>

          {/* Atendida Toggle */}
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-slate-700">Atendida?</label>
            <button 
                type="button"
                onClick={() => setIsAnswered(!isAnswered)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isAnswered ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAnswered ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Duração (minutos)</label>
            <input 
                type="number" 
                min="0"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-700"
                value={duration}
                onChange={e => setDuration(parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Descrição</label>
            <textarea 
                rows={3}
                placeholder="Detalhes da atividade..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-slate-700"
                value={description}
                onChange={e => setDescription(e.target.value)}
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
              disabled={loading || !selectedLead}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Registrar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};