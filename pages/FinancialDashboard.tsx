import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  Handshake, 
  Calendar, 
  Rocket, 
  Settings, 
  Download, 
  RefreshCw,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Type Definitions
interface Sale {
  id: number;
  desc: string;
  date: string;
  value: number;
  closerName: string;
  sdrName: string;
}

interface Rules {
  t1: number;
  t2: number;
  c1: number;
  s1: number;
  c2: number;
  s2: number;
  c3: number;
  s3: number;
}

interface Config {
  metaAnual: number;
  conversao: number;
  metasMensais: Record<string, number>;
  defaults: { cn: string; sn: string };
  rules: Rules;
}

// Storage Keys matching the provided legacy code
const DB_SALES_PREFIX = 'dash_vendas_';
const DB_CONFIG = 'dash_config_v2';

export const FinancialDashboard: React.FC = () => {
  // State
  const [monthKey, setMonthKey] = useState<string>('');
  const [sales, setSales] = useState<Sale[]>([]);
  const [config, setConfig] = useState<Config>({
    metaAnual: 0,
    conversao: 10,
    metasMensais: {},
    defaults: { cn: '', sn: '' },
    rules: { t1: 50000, t2: 75000, c1: 5, s1: 1, c2: 10, s2: 2, c3: 12, s3: 3 }
  });
  
  // Inputs State
  const [inpDesc, setInpDesc] = useState('');
  const [inpDate, setInpDate] = useState('');
  const [inpVal, setInpVal] = useState('');
  const [inpCloser, setInpCloser] = useState('');
  const [inpSdr, setInpSdr] = useState('');
  const [metaMensalInput, setMetaMensalInput] = useState('');

  // Initialization
  useEffect(() => {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    setMonthKey(currentMonthKey);
    setInpDate(`${currentMonthKey}-${String(now.getDate()).padStart(2,'0')}`);

    // Load Config
    const savedCfg = localStorage.getItem(DB_CONFIG);
    if(savedCfg) {
        try {
            const parsed = JSON.parse(savedCfg);
            setConfig(prev => ({ 
                ...prev, 
                ...parsed,
                rules: parsed.rules || prev.rules // Ensure rules exist
            }));
        } catch(e) { console.error("Config load error", e); }
    }
  }, []);

  // Load Sales & Meta when month changes
  useEffect(() => {
    if(!monthKey) return;
    
    // Load Sales
    const raw = localStorage.getItem(DB_SALES_PREFIX + monthKey);
    if(raw) {
        try { setSales(JSON.parse(raw)); } catch(e) { setSales([]); }
    } else {
        setSales([]);
    }

    // Load Meta Input
    const meta = config.metasMensais[monthKey] || 0;
    setMetaMensalInput(meta ? meta.toString() : '');
    
    // Defaults for inputs
    setInpCloser(config.defaults.cn || '');
    setInpSdr(config.defaults.sn || '');

  }, [monthKey, config.metasMensais, config.defaults]);

  // Calculations
  const totalSales = useMemo(() => sales.reduce((acc, s) => acc + s.value, 0), [sales]);
  
  const currentRates = useMemo(() => {
    const { rules } = config;
    if (totalSales > rules.t2) return { closer: rules.c3, sdr: rules.s3, tier: 3 };
    if (totalSales > rules.t1) return { closer: rules.c2, sdr: rules.s2, tier: 2 };
    return { closer: rules.c1, sdr: rules.s1, tier: 1 };
  }, [totalSales, config.rules]);

  const comms = useMemo(() => {
    let totalC = 0, totalS = 0;
    sales.forEach(s => {
        totalC += s.value * (currentRates.closer / 100);
        totalS += s.value * (currentRates.sdr / 100);
    });
    return { closer: totalC, sdr: totalS, total: totalC + totalS };
  }, [sales, currentRates]);

  const annualTotal = useMemo(() => {
    if(!monthKey) return 0;
    const year = monthKey.split('-')[0];
    let total = 0;
    for(let i=0; i<localStorage.length; i++){
        const k = localStorage.key(i);
        if(k && k.startsWith(DB_SALES_PREFIX + year)) {
            try {
                const arr = JSON.parse(localStorage.getItem(k) || '[]');
                total += arr.reduce((a:any,b:any)=>a+b.value, 0);
            } catch(e) {}
        }
    }
    // Add current session sales if not saved yet? No, useEffect saves it.
    return total;
  }, [sales, monthKey]); // Re-calc when current month sales change

  const chartData = useMemo(() => {
      if(!monthKey) return [];
      const [y, m] = monthKey.split('-').map(Number);
      const daysInMonth = new Date(y, m, 0).getDate();
      
      // Initialize array with 0s
      const data = Array.from({length: daysInMonth}, (_, i) => ({ day: i + 1, value: 0 }));
      
      sales.forEach(s => {
          const d = parseInt(s.date.split('-')[2]);
          if(d && data[d-1]) data[d-1].value += s.value;
      });

      return data;
  }, [sales, monthKey]);

  // Actions
  const handleAddSale = () => {
    if(!inpDate || !inpVal || parseFloat(inpVal) <= 0) {
        alert("Verifique a data e o valor.");
        return;
    }
    if(!inpDate.startsWith(monthKey)) {
        alert("A data deve pertencer ao mês selecionado no topo.");
        return;
    }

    const val = parseFloat(inpVal);
    const newSale: Sale = {
        id: Date.now(),
        desc: inpDesc,
        date: inpDate,
        value: val,
        closerName: inpCloser,
        sdrName: inpSdr
    };

    const newSales = [...sales, newSale];
    setSales(newSales);
    localStorage.setItem(DB_SALES_PREFIX + monthKey, JSON.stringify(newSales));
    
    // Save Defaults
    const newConfig = {
        ...config,
        defaults: { cn: inpCloser, sn: inpSdr }
    };
    setConfig(newConfig);
    localStorage.setItem(DB_CONFIG, JSON.stringify(newConfig));

    // Reset Inputs
    setInpDesc('');
    setInpVal('');
  };

  const handleDeleteSale = (id: number) => {
      if(window.confirm("Excluir venda?")) {
          const newSales = sales.filter(s => s.id !== id);
          setSales(newSales);
          localStorage.setItem(DB_SALES_PREFIX + monthKey, JSON.stringify(newSales));
      }
  };

  const handleSaveConfig = () => {
      const newConfig = { ...config };
      // Meta Mensal
      if(monthKey) {
          const meta = parseFloat(metaMensalInput) || 0;
          newConfig.metasMensais[monthKey] = meta;
      }
      localStorage.setItem(DB_CONFIG, JSON.stringify(newConfig));
      setConfig(newConfig);
  };

  const handleReset = () => {
      if(window.confirm("Isso apagará TODAS as configurações e vendas locais. Continuar?")) {
          localStorage.clear();
          window.location.reload();
      }
  };

  const exportPDF = () => {
    const doc = new jsPDF('l');
    const r = currentRates;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229);
    doc.text(`Relatório Financeiro: ${monthKey}`, 14, 20);

    // Header Summary
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`Faturamento Total: R$ ${totalSales.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 14, 30);
    doc.text(`Total Comissões: R$ ${comms.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 80, 30);
    doc.text(`Faixa Aplicada: ${r.closer}% Closer / ${r.sdr}% SDR`, 150, 30);

    const tableData = sales
        .sort((a,b) => a.date.localeCompare(b.date))
        .map(s => {
            const c = s.value * (r.closer/100);
            const d = s.value * (r.sdr/100);
            return [
                s.date.split('-').reverse().join('/'),
                s.desc,
                s.closerName || '-',
                c > 0 ? `R$ ${c.toFixed(2)}` : '-',
                s.sdrName || '-',
                d > 0 ? `R$ ${d.toFixed(2)}` : '-',
                `R$ ${s.value.toFixed(2)}`
            ];
        });

    (doc as any).autoTable({
        startY: 40,
        head: [['Data', 'Descrição', 'Closer', 'Comissão', 'SDR', 'Comissão', 'Venda Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        foot: [['', 'TOTAIS', '', '', '', `R$ ${comms.total.toFixed(2)}`, `R$ ${totalSales.toFixed(2)}`]],
        footStyles: { fillColor: [240, 240, 240], textColor: [0,0,0], fontStyle: 'bold', halign: 'right' },
        columnStyles: { 
            6: { halign: 'right', fontStyle: 'bold' } 
        }
    });

    doc.save(`Faturamento_${monthKey}.pdf`);
  };

  // Derived Display Helpers
  const meta = config.metasMensais[monthKey] || 0;
  const progressPct = meta > 0 ? (totalSales/meta) * 100 : 0;
  
  // Daily Goal Logic
  const calculateDailyGoal = () => {
      if(!monthKey) return { val: 0, txt: '-'};
      const [y, m] = monthKey.split('-').map(Number);
      const daysInMonth = new Date(y, m, 0).getDate();
      const now = new Date();
      
      // If we are looking at current month
      if(now.getFullYear() === y && (now.getMonth()+1) === m) {
          const currentDay = now.getDate();
          const remain = (daysInMonth - currentDay) + 1;
          const lack = Math.max(0, meta - totalSales);
          if(remain > 0) return { val: lack / remain, txt: `P/ os próximos ${remain} dias` };
          else return { val: lack, txt: 'Último dia' };
      }
      return { val: 0, txt: 'Mês encerrado/futuro' };
  };
  const dailyGoal = calculateDailyGoal();

  // Funnel Logic
  const funnel = useMemo(() => {
      const falta = Math.max(0, meta - totalSales);
      const ticket = sales.length ? totalSales / sales.length : 0;
      const salesNeeded = (falta > 0 && ticket > 0) ? Math.ceil(falta/ticket) : 0;
      const leadsNeeded = Math.ceil(salesNeeded / (config.conversao/100));
      return { falta, salesNeeded, leadsNeeded };
  }, [meta, totalSales, sales.length, config.conversao]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-inter text-slate-700">
      
      {/* Top Header & Config */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                 <DollarSign className="text-emerald-600" />
                 Dashboard Financeiro
              </h1>
              <p className="text-slate-500 text-sm">Política de Comissão Progressiva e Metas</p>
          </div>

          <div className="flex flex-wrap gap-4 items-end">
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mês Referência</label>
                  <input 
                    type="month" 
                    className="w-40 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={monthKey}
                    onChange={(e) => setMonthKey(e.target.value)}
                  />
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Meta Mensal (R$)</label>
                  <input 
                    type="number" 
                    className="w-32 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="0.00"
                    value={metaMensalInput}
                    onChange={(e) => setMetaMensalInput(e.target.value)}
                    onBlur={handleSaveConfig}
                  />
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Conv. (%)</label>
                  <input 
                    type="number" 
                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={config.conversao}
                    onChange={(e) => setConfig({...config, conversao: parseFloat(e.target.value) || 0})}
                    onBlur={handleSaveConfig}
                  />
              </div>
              <div className="flex gap-2">
                  <button onClick={exportPDF} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                      <Download size={16} /> PDF
                  </button>
                  <button onClick={handleReset} className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-red-200">
                      <RefreshCw size={16} /> Reset
                  </button>
              </div>
          </div>
      </div>

      {/* Tier Progress Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="relative mb-8 px-4">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full"></div>
              <div 
                className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${totalSales >= config.rules.t2 ? 100 : totalSales >= config.rules.t1 ? 50 : 10}%` }}
              ></div>
              
              <div className="relative flex justify-between text-sm font-medium text-slate-400">
                  <div className={`flex flex-col items-center gap-2 transition-colors ${currentRates.tier >= 1 ? 'text-emerald-600' : ''}`}>
                      <div className={`w-4 h-4 rounded-full border-4 ${currentRates.tier >= 1 ? 'border-emerald-500 bg-white' : 'border-slate-200 bg-slate-50'}`}></div>
                      <span>Faixa 1 (Até {config.rules.t1/1000}k)</span>
                  </div>
                  <div className={`flex flex-col items-center gap-2 transition-colors ${currentRates.tier >= 2 ? 'text-emerald-600' : ''}`}>
                      <div className={`w-4 h-4 rounded-full border-4 ${currentRates.tier >= 2 ? 'border-emerald-500 bg-white' : 'border-slate-200 bg-slate-50'}`}></div>
                      <span>Faixa 2 ({config.rules.t1/1000}k - {config.rules.t2/1000}k)</span>
                  </div>
                  <div className={`flex flex-col items-center gap-2 transition-colors ${currentRates.tier >= 3 ? 'text-emerald-600' : ''}`}>
                      <div className={`w-4 h-4 rounded-full border-4 ${currentRates.tier >= 3 ? 'border-emerald-500 bg-white' : 'border-slate-200 bg-slate-50'}`}></div>
                      <span>Faixa 3 (+{config.rules.t2/1000}k)</span>
                  </div>
              </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between text-sm">
             <div className="flex items-center gap-2 text-slate-600">
                 <Settings size={16} />
                 <span className="font-bold uppercase text-xs">Regras de Comissão (Closer / SDR):</span>
             </div>
             <div className="flex gap-6">
                 <div className="flex items-center gap-2">
                     <span className="text-slate-500">Até R$ {config.rules.t1/1000}k:</span>
                     <div className="flex gap-1">
                        <input type="number" className="w-12 px-1 py-0.5 border rounded text-center text-xs" value={config.rules.c1} onChange={e => setConfig({...config, rules: {...config.rules, c1: parseFloat(e.target.value)}})} onBlur={handleSaveConfig} />% /
                        <input type="number" className="w-12 px-1 py-0.5 border rounded text-center text-xs" value={config.rules.s1} onChange={e => setConfig({...config, rules: {...config.rules, s1: parseFloat(e.target.value)}})} onBlur={handleSaveConfig} />%
                     </div>
                 </div>
                 <div className="flex items-center gap-2">
                     <span className="text-slate-500">Até R$ {config.rules.t2/1000}k:</span>
                     <div className="flex gap-1">
                        <input type="number" className="w-12 px-1 py-0.5 border rounded text-center text-xs" value={config.rules.c2} onChange={e => setConfig({...config, rules: {...config.rules, c2: parseFloat(e.target.value)}})} onBlur={handleSaveConfig} />% /
                        <input type="number" className="w-12 px-1 py-0.5 border rounded text-center text-xs" value={config.rules.s2} onChange={e => setConfig({...config, rules: {...config.rules, s2: parseFloat(e.target.value)}})} onBlur={handleSaveConfig} />%
                     </div>
                 </div>
                 <div className="flex items-center gap-2">
                     <span className="text-slate-500">Acima:</span>
                     <div className="flex gap-1">
                        <input type="number" className="w-12 px-1 py-0.5 border rounded text-center text-xs" value={config.rules.c3} onChange={e => setConfig({...config, rules: {...config.rules, c3: parseFloat(e.target.value)}})} onBlur={handleSaveConfig} />% /
                        <input type="number" className="w-12 px-1 py-0.5 border rounded text-center text-xs" value={config.rules.s3} onChange={e => setConfig({...config, rules: {...config.rules, s3: parseFloat(e.target.value)}})} onBlur={handleSaveConfig} />%
                     </div>
                 </div>
             </div>
          </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
              <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Vendido (Mês)</span>
                  <DollarSign size={20} className="text-indigo-200" />
              </div>
              <div className="text-2xl font-bold text-slate-800">
                  {totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <div className="mt-3 text-xs flex justify-between items-center text-slate-500">
                  <span>Progresso da Meta</span>
                  <span className="font-bold">{progressPct.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div className="bg-indigo-500 h-full transition-all duration-500" style={{width: `${Math.min(progressPct, 100)}%`}}></div>
              </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-purple-500">
              <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Comissões</span>
                  <Handshake size={20} className="text-purple-200" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                  {comms.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <div className="mt-3 text-xs text-slate-500 border-t border-slate-50 pt-2">
                 Aplicando: <strong className="text-purple-700">Faixa {currentRates.tier}</strong> em todo montante
              </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
              <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Meta Diária (Hoje)</span>
                  <Calendar size={20} className="text-amber-200" />
              </div>
              <div className="text-2xl font-bold text-slate-800">
                  {dailyGoal.val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <div className="mt-3 text-xs text-slate-500">
                 {dailyGoal.txt} para bater a meta
              </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
              <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Acumulado Anual</span>
                  <Rocket size={20} className="text-emerald-200" />
              </div>
              <div className="text-2xl font-bold text-slate-800">
                  {annualTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <div className="mt-3 text-xs text-slate-500 cursor-pointer hover:text-emerald-600" onClick={() => {
                  const v = prompt("Definir Meta Anual:", config.metaAnual.toString());
                  if(v) {
                      const newCfg = {...config, metaAnual: parseFloat(v)};
                      setConfig(newCfg);
                      localStorage.setItem(DB_CONFIG, JSON.stringify(newCfg));
                  }
              }}>
                 Meta Anual: <span className="font-bold underline decoration-dotted">{config.metaAnual ? config.metaAnual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0}) : 'Definir'}</span>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[350px_1fr] gap-6">
          
          {/* Sidebar Area */}
          <div className="space-y-6">
              {/* Funnel Widget */}
              <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white p-6 rounded-2xl shadow-lg">
                  <h3 className="text-lg font-bold mb-1">📢 Funil de Vendas</h3>
                  <p className="text-indigo-200 text-xs mb-4">Estimativa baseada em {config.conversao}% de conversão.</p>
                  
                  <div className="flex justify-between py-2 border-b border-white/10 text-sm">
                      <span>Falta para Meta</span>
                      <strong className="text-amber-300">{funnel.falta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10 text-sm mb-6">
                      <span>Vendas Necessárias</span>
                      <strong>{funnel.salesNeeded}</strong>
                  </div>

                  <div className="text-center">
                       <div className="text-[10px] uppercase tracking-widest text-indigo-300 mb-1">Prospecções Necessárias</div>
                       <div className="text-4xl font-bold text-amber-400 mb-1">{funnel.leadsNeeded}</div>
                       <div className="text-xs text-indigo-300">clientes para contactar</div>
                  </div>
              </div>

              {/* Add Sale Form */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Plus size={18} className="text-indigo-600" /> Nova Venda
                  </h3>
                  
                  <div className="space-y-3">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                          <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Ex: Contrato Anual" value={inpDesc} onChange={e => setInpDesc(e.target.value)} />
                      </div>
                      <div className="flex gap-3">
                          <div className="flex-1">
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
                             <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={inpDate} onChange={e => setInpDate(e.target.value)} />
                          </div>
                          <div className="flex-1">
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (R$)</label>
                             <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="0.00" value={inpVal} onChange={e => setInpVal(e.target.value)} />
                          </div>
                      </div>

                      <div className="h-px bg-slate-100 my-2"></div>
                      
                      <div>
                          <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Closer</label>
                                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs" placeholder="Nome Closer" value={inpCloser} onChange={e => setInpCloser(e.target.value)} />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do SDR</label>
                                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs" placeholder="Nome SDR" value={inpSdr} onChange={e => setInpSdr(e.target.value)} />
                              </div>
                          </div>
                      </div>

                      <div className={`text-center py-2 rounded-lg text-xs font-bold mt-2 ${currentRates.tier > 1 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-indigo-50 text-indigo-600 border border-indigo-200'}`}>
                          Faixa Atual: {currentRates.closer}% / {currentRates.sdr}%
                      </div>

                      <button onClick={handleAddSale} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold text-sm transition-colors shadow-sm">
                          Adicionar Venda
                      </button>
                  </div>
              </div>
          </div>

          {/* Main Area */}
          <div className="space-y-6">
              {/* Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[350px]">
                  <h3 className="font-bold text-slate-800 mb-4">Evolução Diária</h3>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `R$${val/1000}k`} axisLine={false} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        />
                        <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-bold text-slate-800">Histórico de Vendas</h3>
                      <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md">{sales.length} registros</span>
                  </div>
                  
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                              <tr>
                                  <th className="px-6 py-3">Data</th>
                                  <th className="px-6 py-3">Descrição</th>
                                  <th className="px-6 py-3">Closer</th>
                                  <th className="px-6 py-3">SDR</th>
                                  <th className="px-6 py-3 text-right">Valor</th>
                                  <th className="px-6 py-3"></th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {sales.length === 0 ? (
                                  <tr>
                                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                          <div className="flex flex-col items-center gap-2">
                                              <AlertCircle className="opacity-20" size={32} />
                                              <p>Nenhuma venda lançada neste mês.</p>
                                          </div>
                                      </td>
                                  </tr>
                              ) : (
                                  sales.sort((a,b) => b.date.localeCompare(a.date)).map(s => {
                                      const cComm = s.value * (currentRates.closer/100);
                                      const sComm = s.value * (currentRates.sdr/100);
                                      return (
                                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-3 text-slate-500">{s.date.split('-').reverse().slice(0,2).join('/')}</td>
                                            <td className="px-6 py-3 font-medium text-slate-700">{s.desc}</td>
                                            <td className="px-6 py-3">
                                                {s.closerName && (
                                                    <div>
                                                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">{s.closerName}</span>
                                                        <div className="text-[10px] text-slate-400 mt-0.5">R$ {cComm.toFixed(2)}</div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-3">
                                                {s.sdrName && (
                                                    <div>
                                                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">{s.sdrName}</span>
                                                        <div className="text-[10px] text-slate-400 mt-0.5">R$ {sComm.toFixed(2)}</div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-right font-bold text-slate-700">
                                                {s.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <button onClick={() => handleDeleteSale(s.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                      );
                                  })
                              )}
                          </tbody>
                          <tfoot className="bg-slate-50 font-bold text-slate-700 border-t border-slate-200">
                              <tr>
                                  <td colSpan={2} className="px-6 py-4">TOTAIS DO MÊS</td>
                                  <td className="px-6 py-4">
                                      <div className="text-xs text-slate-400 font-normal">Comissões</div>
                                      <div>R$ {comms.closer.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <div className="text-xs text-slate-400 font-normal">Comissões</div>
                                      <div>R$ {comms.sdr.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                                  </td>
                                  <td className="px-6 py-4 text-right text-indigo-600 text-lg">
                                      {totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                  </td>
                                  <td></td>
                              </tr>
                          </tfoot>
                      </table>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};