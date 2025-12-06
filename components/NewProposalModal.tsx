import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { SalesData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { jsPDF } from 'jspdf';

interface NewProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SalesData) => void;
  existingLeads: string[];
  sdrs: string[];
  closers: string[];
}

export const NewProposalModal: React.FC<NewProposalModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  existingLeads,
  sdrs,
  closers
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [selectedLead, setSelectedLead] = useState('');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const generatePDF = (leadName: string, proposalValue: string, obs: string) => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString('pt-BR');

    // Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text("Proposta Comercial", 20, 20);
    
    // Line
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 25, 190, 25);

    // Content
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    
    doc.setFont("helvetica", "bold");
    doc.text("Cliente:", 20, 40);
    doc.setFont("helvetica", "normal");
    doc.text(leadName, 50, 40);

    doc.setFont("helvetica", "bold");
    doc.text("Data:", 20, 50);
    doc.setFont("helvetica", "normal");
    doc.text(date, 50, 50);

    doc.setFont("helvetica", "bold");
    doc.text("Valor:", 20, 60);
    doc.setFont("helvetica", "normal");
    doc.text(`R$ ${parseFloat(proposalValue).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 50, 60);

    if (obs) {
        doc.setFont("helvetica", "bold");
        doc.text("Detalhes:", 20, 80);
        doc.setFont("helvetica", "normal");
        
        const splitText = doc.splitTextToSize(obs, 170);
        doc.text(splitText, 20, 90);
    }

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Documento gerado automaticamente pelo SalesOptima.", 20, 280);

    doc.save(`Proposta_${leadName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !value) return;
    
    setLoading(true);
    
    // Generate PDF immediately before saving logic
    try {
        generatePDF(selectedLead, value, notes);
    } catch (error) {
        console.error("Erro ao gerar PDF", error);
        alert("Erro ao gerar PDF, mas os dados serão salvos.");
    }

    await new Promise(r => setTimeout(r, 600));

    // Try to assign a closer if available, otherwise fallback
    const closer = closers.length > 0 ? closers[0] : (user?.name || 'N/A');

    const newProposal: SalesData = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      leadName: selectedLead,
      type: 'proposal',
      outcome: 'sent',
      sdrName: user?.name || 'N/A', // Current user usually sends it
      closerName: closer,
      value: parseFloat(value),
      notes: notes,
      leadStatus: 'Proposta Enviada'
    };

    onSave(newProposal);
    setLoading(false);
    
    // Reset
    setSelectedLead('');
    setValue('');
    setNotes('');
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200 font-inter">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Enviar Proposta</h2>
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

          {/* Valor */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Valor da Proposta *</label>
            <input 
                type="number" 
                placeholder="0.00"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-700"
                value={value}
                onChange={e => setValue(e.target.value)}
                required
                step="0.01"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Observações</label>
            <textarea 
                rows={3}
                placeholder="Detalhes da proposta..."
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
              disabled={loading || !selectedLead || !value}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Enviar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};