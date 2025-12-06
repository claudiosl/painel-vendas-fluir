import React, { useState, useMemo } from 'react';
import { SalesData } from '../types';
import { Download, Trash2, Search, FilterX } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface DataListProps {
  data: SalesData[];
  onDelete: (id: string) => void;
}

export const DataList: React.FC<DataListProps> = ({ data, onDelete }) => {
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const typeFilter = searchParams.get('type');
  const urlSearch = searchParams.get('search');

  // Sync internal search with URL search param if present on mount
  React.useEffect(() => {
    if (urlSearch) {
      setSearch(urlSearch);
    }
  }, [urlSearch]);

  const filteredData = useMemo(() => {
    return data.filter(d => {
      const searchTerm = search.toLowerCase();
      // Search Text including Lead Name
      const matchesSearch = 
        (d.leadName || '').toLowerCase().includes(searchTerm) ||
        d.sdrName.toLowerCase().includes(searchTerm) ||
        d.type.toLowerCase().includes(searchTerm) ||
        d.outcome.toLowerCase().includes(searchTerm) ||
        (d.closerName?.toLowerCase().includes(searchTerm) ?? false);

      // Type Filter from URL
      const matchesType = typeFilter ? d.type === typeFilter : true;

      return matchesSearch && matchesType;
    });
  }, [data, search, typeFilter]);

  const downloadCSV = () => {
    const headers = ['ID', 'Data', 'Lead/Cliente', 'Tipo', 'Resultado', 'SDR', 'Closer', 'Valor', 'Notas'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + filteredData.map(e => `${e.id},${e.date},"${e.leadName || ''}",${e.type},${e.outcome},${e.sdrName},${e.closerName || ''},${e.value || 0},"${e.notes || ''}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_data_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTitle = () => {
    switch(typeFilter) {
      case 'call': return 'Histórico de Atividades';
      case 'meeting_held': return 'Reuniões Realizadas';
      case 'proposal': return 'Propostas Comerciais';
      case 'sale': return 'Vendas Fechadas';
      default: return 'Base de Dados Completa';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{getTitle()}</h2>
          <p className="text-slate-500">{filteredData.length} registros encontrados.</p>
        </div>
        <button
          onClick={downloadCSV}
          className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
        >
          <Download size={18} />
          Exportar Lista
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-4">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por lead, sdr, tipo ou resultado..."
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Limpar busca"
            >
              <FilterX size={18} />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-slate-900">Data</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Lead / Empresa</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Tipo</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Resultado</th>
                <th className="px-6 py-3 font-semibold text-slate-900">SDR</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Valor</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.slice(0, 50).map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-3 whitespace-nowrap text-slate-500">{new Date(row.date).toLocaleDateString()}</td>
                  <td className="px-6 py-3 font-semibold text-slate-700">{row.leadName || '-'}</td>
                  <td className="px-6 py-3 capitalize">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      row.type === 'sale' ? 'bg-emerald-100 text-emerald-700' : 
                      row.type === 'call' ? 'bg-blue-50 text-blue-700' : 
                      row.type === 'proposal' ? 'bg-purple-50 text-purple-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {row.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-3 capitalize">
                    {row.outcome === 'closed_won' ? (
                       <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                         Ganha
                       </span>
                    ) : row.outcome.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-3 text-slate-500">{row.sdrName}</td>
                  <td className="px-6 py-3 font-medium text-slate-900">
                    {row.value ? `R$ ${row.value.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-3">
                    <button 
                      onClick={() => onDelete(row.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <Search size={32} className="opacity-20" />
                       <p>Nenhum registro encontrado.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 text-center">
          Exibindo os últimos 50 registros de {filteredData.length} encontrados.
        </div>
      </div>
    </div>
  );
};