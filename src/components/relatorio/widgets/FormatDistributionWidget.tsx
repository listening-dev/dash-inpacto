import React from 'react';
import { FormatoSnapshotRow } from '../../../types/relatorio';

interface Props {
  snapshot: FormatoSnapshotRow[];
}

const FORMAT_COLORS: Record<string, string> = {
  IMAGEM: 'bg-[#C0392B]',
  REELS: 'bg-[#E67E22]',
  CARROSSEL: 'bg-[#4a7c59]',
  VÍDEO: 'bg-[#797878]',
  STORY: 'bg-[#b0c4de]',
  OUTROS: 'bg-gray-300',
};

export default function FormatDistributionWidget({ snapshot }: Props) {
  if (!snapshot || snapshot.length === 0) {
    return <div className="text-center text-gray-400 py-8 text-sm">Sem dados para exibir</div>;
  }

  const total = snapshot.reduce((s, r) => s + r.count, 0);
  const sorted = [...snapshot].sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-3">
      {sorted.map(row => {
        const pct = total > 0 ? (row.count / total) * 100 : 0;
        const colorClass = FORMAT_COLORS[row.formato] || 'bg-gray-300';
        return (
          <div key={row.formato}>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span className="font-medium">{row.formato}</span>
              <span className="font-bold">{row.count} ({pct.toFixed(0)}%)</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${colorClass} rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-gray-400 pt-1">Total: {total} posts</p>
    </div>
  );
}
