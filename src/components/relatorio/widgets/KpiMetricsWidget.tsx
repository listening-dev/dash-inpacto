import React from 'react';
import { KpiSnapshotData } from '../../../types/relatorio';
import { PLATFORM_LABELS } from '../widgetRegistry';

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.', ',') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.', ',') + 'K';
  return n.toLocaleString('pt-BR');
}

interface Props {
  snapshot: KpiSnapshotData;
}

const Card = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-1 shadow-sm">
    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
    <span className="text-2xl font-bold text-gray-900">{value}</span>
    {sub && <span className="text-xs text-gray-400">{sub}</span>}
  </div>
);

export default function KpiMetricsWidget({ snapshot }: Props) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-3">{PLATFORM_LABELS[snapshot.platform] || snapshot.platform}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card label="Alcance" value={fmtNum(snapshot.alcance)} />
        <Card label="Visualizações" value={fmtNum(snapshot.visualizacoes)} />
        <Card label="Interações" value={fmtNum(snapshot.interacoes)} />
        <Card label="Novos Seguidores" value={fmtNum(snapshot.novosSeguidores)} />
        <Card label="Total Seguidores" value={fmtNum(snapshot.totalSeguidores)} />
        <Card label="Engajamento" value={`${snapshot.engajamentoTaxa.toFixed(2).replace('.', ',')}%`} />
      </div>
    </div>
  );
}
