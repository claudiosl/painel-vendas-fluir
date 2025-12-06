import React, { useMemo, useState, useRef } from 'react';
import { 
  Phone, 
  PhoneIncoming,
  Calendar, 
  FileText, 
  Trophy, 
  DollarSign, 
  Target, 
  Clock,
  Download,
  Upload,
  ChevronDown,
  Filter
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import { SalesData, LeadSource, Outcome } from '../types';
import { calculateKPIs } from '../services/dataService';

interface DashboardProps {
  data: SalesData[];
  onImport: (data: SalesData[]) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onImport }) => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [channel, setChannel] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filtering logic
  const filteredData = useMemo(() => {
    return data.filter(d => {
      // Date Filter
      if (dateRange.start) {
        if (new Date(d.date) < new Date(dateRange.start)) return false;
      }
      if (dateRange.end) {
        if (new Date(d.date) > new Date(dateRange.end)) return false;
      }
      
      // Channel Filter
      if (channel !== 'all' && d.leadSource !== channel) return false;
      
      // Status Filter
      if (status !== 'all' && d.outcome !== status) return false;

      return true;
    });
  }, [data, dateRange, channel, status]);

  const kpis = useMemo(() => calculateKPIs(filteredData), [filteredData]);

  // Chart Data
  const funnelData = [
    { name: 'Ligações', value: kpis.totalCalls, fill: '#3b82f6' },
    { name: 'Reuniões', value: kpis.meetingsBooked, fill: '#f59e0b' },
    { name: 'Propostas', value: kpis.proposalsSent, fill: '#64748b' },
    { name: 'Vendas', value: kpis.salesClosed, fill: '#10b981' },
  ];

  const trendData = useMemo(() => {
    if (filteredData.length === 0) return [];
    const grouped: Record<string, number> = {};
    // Initialize with 0 for better chart look? Or just sparse. 
    // Let's use sparse for now, but sorted.
    filteredData.forEach(d => {
      if (d.type === 'sale' && d.outcome === 'closed_won') {
        grouped[d.date] = (grouped[d.date] || 0) + (d.value || 0);
      }
    });
    return Object.keys(grouped).sort().map(date => ({
      date,
      revenue: grouped[date]
    }));
  }, [filteredData]);

  const handleExport = () => {
    const headers = ['ID', 'Data', 'Lead/Cliente', 'Tipo', 'Resultado', 'Valor', 'SDR', 'Closer', 'Produto', 'Origem'];
    const csv = [
        headers.join(','),
        ...filteredData.map(d => [
          d.id, d.date, `"${d.leadName || ''}"`, d.type, d.outcome, d.value || 0, d.sdrName, d.closerName || '', d.product || '', d.leadSource || ''
        ].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const processCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const newEntries: SalesData[] = [];
      
      // Skip header, start from 1
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple CSV split (note: this is a simple splitter, won't handle commas in quotes perfectly unless regex is used)
        // For standard internal exports/imports it should work if we respect the structure.
        const cols = line.split(',');
        if (cols.length < 4) continue;

        // Try to handle optional lead name column for backward compatibility or new format
        // Expected: ID, Date, LeadName, Type, Outcome, Value, SDR, Closer...
        // If imported from old format, col index shifts. 
        // Let's assume the user uses the new export format to re-import.
        
        // Very basic heuristic check
        const hasLeadColumn = isNaN(parseFloat(cols[4])); // If 4th col is not number (value), it might be type/outcome or shifted.

        newEntries.push({
          id: Math.random().toString(36).substr(2, 9),
          date: cols[1] || new Date().toISOString().split('T')[0],
          leadName: cols[2]?.replace(/"/g, '') || 'Lead Importado', // Index 2 is Lead Name in new format
          type: (cols[3] as any) || 'call',
          outcome: (cols[4] as any) || 'connected',
          value: parseFloat(cols[5]) || 0,
          sdrName: cols[6] || 'Importado',
          closerName: cols[7] || '',
          product: (cols[8] as any) || 'SaaS Enterprise',
          leadSource: (cols[9] as any) || 'Outbound',
        });
      }
      
      if (newEntries.length > 0) {
        onImport(newEntries);
        alert(`${newEntries.length} registros importados com sucesso!`);
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h2>
          <p className="text-slate-500 text-sm">Visão geral do desempenho comercial</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          
          {/* Date Picker */}
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white w-full md:w-auto shadow-sm">
            <Calendar size={18} className="text-slate-400" />
            <input 
              type="date" 
              className="text-sm text-slate-600 outline-none bg-transparent w-full md:w-32"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
            <span className="text-slate-300">-</span>
             <input 
              type="date" 
              className="text-sm text-slate-600 outline-none bg-transparent w-full md:w-32"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>

          {/* Channel Dropdown */}
          <div className="relative group w-full md:w-48">
             <select
               value={channel}
               onChange={(e) => setChannel(e.target.value)}
               className="appearance-none w-full bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-sm text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm cursor-pointer transition-colors hover:border-slate-300"
             >
               <option value="all">Todos os Canais</option>
               <option value="Outbound">Outbound</option>
               <option value="Linkedin">Linkedin</option>
               <option value="Google Ads">Google Ads</option>
               <option value="Indicação">Indicação</option>
               <option value="Eventos">Eventos</option>
             </select>
             <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative group w-full md:w-48">
             <select
               value={status}
               onChange={(e) => setStatus(e.target.value)}
               className="appearance-none w-full bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-sm text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm cursor-pointer transition-colors hover:border-slate-300"
             >
               <option value="all">Todos os Status</option>
               <option value="connected">Atendida</option>
               <option value="show">Show (Reunião)</option>
               <option value="sent">Proposta Enviada</option>
               <option value="closed_won">Venda Fechada</option>
               <option value="closed_lost">Perdida</option>
             </select>
             <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex gap-3 w-full xl:w-auto justify-end border-t xl:border-0 border-slate-100 pt-4 xl:pt-0">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={processCSV}
          />
          <button 
            onClick={handleImportClick}
            className="flex-1 xl:flex-none flex items-center justify-center gap-2 border border-slate-200 rounded-lg px-4 py-2 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
          >
            <Upload size={16} />
            Importar
          </button>
          <button 
            onClick={handleExport}
            className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-slate-800 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-900 transition-colors shadow-sm shadow-slate-200"
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* KPI Grid - 2 rows x 4 cols */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1 */}
        <StatCard
          title="Ligações Realizadas"
          value={kpis.totalCalls}
          subValue={`${kpis.connectedCalls} atendidas`}
          icon={<Phone size={20} />}
          color="blue"
        />
        <StatCard
          title="Taxa de Atendimento"
          value={`${kpis.connectionRate.toFixed(1)}%`}
          subValue={`${kpis.connectedCalls}/${kpis.totalCalls}`}
          icon={<PhoneIncoming size={20} />}
          color="blue"
        />
        <StatCard
          title="Reuniões Realizadas"
          value={kpis.meetingsHeld}
          subValue={`${kpis.showRate.toFixed(0)}% show rate`}
          icon={<Calendar size={20} />}
          color="yellow"
        />
        <StatCard
          title="Propostas Enviadas"
          value={kpis.proposalsSent}
          subValue={`${kpis.proposalToSaleRate.toFixed(0)}% conversão`}
          icon={<FileText size={20} />}
          color="gray"
        />

        {/* Row 2 */}
        <StatCard
          title="Vendas Fechadas"
          value={kpis.salesClosed}
          subValue={`${kpis.overallConversion.toFixed(1)}% conversão`}
          icon={<Trophy size={20} />}
          color="green"
        />
        <StatCard
          title="Faturamento Gerado"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(kpis.totalRevenue)}
          subValue={`Ticket médio: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(kpis.avgTicket)}`}
          icon={<DollarSign size={20} />}
          color="green"
        />
        <StatCard
          title="Conversão Geral"
          value={`${kpis.overallConversion.toFixed(2)}%`}
          subValue="Ligação → Venda"
          icon={<Target size={20} />}
          color="gray"
        />
        <StatCard
          title="Ciclo Médio"
          value={`${kpis.avgSalesCycle} dias`}
          subValue="Lead → Fechamento"
          icon={<Clock size={20} />}
          color="gray"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Faturamento</h3>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12.5% vs mês anterior</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  tickFormatter={(val) => `R$${val/1000}k`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                  labelStyle={{ color: '#64748b' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
           <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Funil de Conversão</h3>
            <Filter size={16} className="text-slate-400" />
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={funnelData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                barSize={32}
              >
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80} 
                  tick={{ fontSize: 12, fontWeight: 500, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};