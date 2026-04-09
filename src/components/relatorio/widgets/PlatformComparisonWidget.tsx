import React from 'react';
import { PlataformaSnapshotRow } from '../../../types/relatorio';

interface Props {
  snapshot: PlataformaSnapshotRow[];
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.', ',') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.', ',') + 'K';
  return (n || 0).toLocaleString('pt-BR');
}

const PLAT_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  twitter: 'X (Twitter)',
};

const PLAT_COLORS: Record<string, string> = {
  instagram: 'text-[#E4405F]',
  facebook: 'text-[#1877F2]',
  linkedin: 'text-[#0077B5]',
  twitter: 'text-[#14171A]',
};

export default function PlatformComparisonWidget({ snapshot }: Props) {
  if (!snapshot || snapshot.length === 0) {
    return <div className="text-center text-gray-400 py-8 text-sm">Sem dados para exibir</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 pr-3 text-xs font-semibold text-gray-500 uppercase">Plataforma</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase">Alcance</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase">Views</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase">Interações</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase">Seg.</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 uppercase">Posts</th>
          </tr>
        </thead>
        <tbody>
          {snapshot.map((row, i) => (
            <tr key={row.platform || i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className={`py-3 pr-3 font-semibold text-sm ${PLAT_COLORS[row.platform] || 'text-gray-700'}`}>
                {PLAT_LABELS[row.platform] || row.platform}
              </td>
              <td className="py-3 px-2 text-right text-gray-800 font-medium text-xs">{fmtNum(row.alcance)}</td>
              <td className="py-3 px-2 text-right text-gray-800 font-medium text-xs">{fmtNum(row.visualizacoes)}</td>
              <td className="py-3 px-2 text-right text-gray-800 font-medium text-xs">{fmtNum(row.interacoes)}</td>
              <td className="py-3 px-2 text-right text-gray-600 text-xs">{fmtNum(row.novosSeguidores)}</td>
              <td className="py-3 px-2 text-right text-gray-600 text-xs">{fmtNum(row.postsCount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
