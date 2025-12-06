import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'yellow' | 'green' | 'gray';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, icon, color = 'blue' }) => {
  const styles = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      iconBg: 'bg-blue-200'
    },
    yellow: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      iconBg: 'bg-yellow-200'
    },
    green: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-600',
      iconBg: 'bg-emerald-200'
    },
    gray: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      iconBg: 'bg-slate-200'
    }
  };

  const theme = styles[color];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-slate-500 leading-tight pr-4">{title}</h3>
        <div className={`p-2.5 rounded-lg ${theme.bg} ${theme.text}`}>
          {icon}
        </div>
      </div>
      <div>
        <span className="text-3xl font-bold text-slate-800 tracking-tight">{value}</span>
        {subValue && (
          <p className="text-xs text-slate-400 mt-1 font-medium">{subValue}</p>
        )}
      </div>
    </div>
  );
};