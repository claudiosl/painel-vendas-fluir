import React, { useMemo, useState } from 'react';
import { SalesData } from '../types';
import { Plus, Search, Building2, Calendar, User, ArrowRight, Phone, Mail, Activity, Clock, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NewLeadModal } from '../components/NewLeadModal';
import { NewActivityModal } from '../components/NewActivityModal';
import { NewMeetingModal } from '../components/NewMeetingModal';
import { NewProposalModal } from '../components/NewProposalModal';

interface LeadsListProps {
  data: SalesData[];
  onAdd: (data: SalesData) => void;
  sdrs: string[];
  closers: string[];
}

export const LeadsList: React.FC<LeadsListProps> = ({ data, onAdd, sdrs, closers }) => {
  const [search, setSearch] = useState('');
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  // Group data by Lead Name
  const leads = useMemo(() => {
    const grouped: Record<string, {
      name: string;
      contact?: string;
      email?: string;
      lastActivityDate: string;
      lastOutcome: string;
      sdr: string;
      totalInteractions: number;
      status: 'active' | 'won' | 'lost';
    }> = {};

    data.forEach(item => {
      const name = item.leadName || 'Sem Nome';
      
      if (!grouped[name]) {
        grouped[name] = {
          name,
          contact: item.contactName,
          email: item.email,
          lastActivityDate: item.date,
          lastOutcome: item.outcome === 'new' ? (item.leadStatus || 'Novo') : item.outcome,
          sdr: item.sdrName,
          totalInteractions: 0,
          status: 'active'
        };
      }

      // Update if current item is more recent
      if (new Date(item.date) > new Date(grouped[name].lastActivityDate)) {
        grouped[name].lastActivityDate = item.date;
        grouped[name].lastOutcome = item.outcome === 'new' ? (item.leadStatus || 'Novo') : item.outcome;
        grouped[name].sdr = item.sdrName;
        // Update contact info if newer entry has it
        if(item.contactName) grouped[name].contact = item.contactName;
        if(item.email) grouped[name].email = item.email;
      }

      // Check status
      if (item.outcome === 'closed_won') grouped[name].status = 'won';
      if (item.outcome === 'closed_lost') grouped[name].status = 'lost';

      grouped[name].totalInteractions++;
    });

    return Object.values(grouped).sort((a, b) => new Date(b.lastActivityDate).getTime() - new Date(a.lastActivityDate).getTime());
  }, [data]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));
  }, [leads, search]);

  // Extract unique lead names for the activity/meeting modals
  const uniqueLeadNames = useMemo(() => leads.map(l => l.name), [leads]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Leads</h2>
          <p className="text-slate-500">Gerencie sua carteira de clientes e prospects.</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
            <button
            onClick={() => setIsActivityModalOpen(true)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-all shadow-sm text-sm"
            >
            <Activity size={16} />
            <span className="hidden sm:inline">Nova Atividade</span>
            </button>
            <button
            onClick={() => setIsMeetingModalOpen(true)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-all shadow-sm text-sm"
            >
            <Clock size={16} />
            <span className="hidden sm:inline">Agendar Reunião</span>
            </button>
             <button
            onClick={() => setIsProposalModalOpen(true)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-all shadow-sm text-sm"
            >
            <FileText size={16} />
            <span className="hidden sm:inline">Enviar Proposta</span>
            </button>
            <button
            onClick={() => setIsLeadModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-all shadow-lg shadow-blue-600/20 text-sm"
            >
            <Plus size={18} />
            <span className="hidden sm:inline">Novo Lead</span>
            <span className="sm:hidden">Novo</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-4">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Buscar leads por nome..."
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-100">
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
              <Building2 size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium text-slate-600">Nenhum lead encontrado</p>
              <p className="text-sm">Clique em "Novo Lead" para começar.</p>
            </div>
          ) : (
            filteredLeads.map((lead, idx) => (
              <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-center justify-between gap-4 group">
                <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${
                    lead.status === 'won' ? 'bg-emerald-100 text-emerald-600' :
                    lead.status === 'lost' ? 'bg-slate-100 text-slate-400' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{lead.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-slate-500 mt-1">
                      {lead.contact && (
                         <span className="flex items-center gap-1"><User size={12} /> {lead.contact}</span>
                      )}
                      {lead.email && (
                         <span className="hidden sm:flex items-center gap-1"><Mail size={12} /> {lead.email}</span>
                      )}
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(lead.lastActivityDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                   <div className="text-right">
                     <span className="block text-xs text-slate-400 uppercase font-semibold">Status</span>
                     <span className={`text-sm font-medium capitalize ${
                        lead.status === 'won' ? 'text-emerald-600' : 
                        lead.lastOutcome === 'Novo' ? 'text-blue-600' : 'text-slate-700'
                     }`}>
                       {lead.lastOutcome.replace('_', ' ')}
                     </span>
                   </div>
                   
                   <Link 
                    to={`/data?search=${encodeURIComponent(lead.name)}`}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Ver Histórico"
                   >
                     <ArrowRight size={20} />
                   </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <NewLeadModal 
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSave={onAdd}
        sdrs={sdrs}
        closers={closers}
      />

      <NewActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onSave={onAdd}
        existingLeads={uniqueLeadNames}
      />

      <NewMeetingModal 
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        onSave={onAdd}
        existingLeads={uniqueLeadNames}
        sdrs={sdrs}
        closers={closers}
      />

      <NewProposalModal 
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        onSave={onAdd}
        existingLeads={uniqueLeadNames}
        sdrs={sdrs}
        closers={closers}
      />
    </div>
  );
};