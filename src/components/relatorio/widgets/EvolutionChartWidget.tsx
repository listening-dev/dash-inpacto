import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { EvolucaoSnapshotRow } from '../../../types/relatorio';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  snapshot: EvolucaoSnapshotRow[];
}

function formatLabel(label: string) {
  try {
    return format(parseISO(label), 'dd/MM', { locale: ptBR });
  } catch {
    return label;
  }
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

export default function EvolutionChartWidget({ snapshot }: Props) {
  if (!snapshot || snapshot.length === 0) {
    return <div className="text-center text-gray-400 py-8 text-sm">Sem dados para exibir</div>;
  }

  const chartData = snapshot.map(row => ({ ...row, label: formatLabel(row.label) }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tickFormatter={fmtNum} tick={{ fontSize: 10 }} width={45} />
          <Tooltip formatter={(v: number) => fmtNum(v)} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="alcance" name="Alcance" stroke="#C0392B" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="visualizacoes" name="Visualizações" stroke="#E67E22" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="interacoes" name="Interações" stroke="#797878" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
