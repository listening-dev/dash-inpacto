import React from 'react';
import { TextTipo } from '../../types/relatorio';

const TEXT_TIPO_LABELS: Record<TextTipo, string> = {
  analise: 'Análise Crítica',
  proximos_passos: 'Próximos Passos',
  planos_acao: 'Planos de Ação',
  livre: 'Texto Livre',
};

const TEXT_TIPO_COLORS: Record<TextTipo, string> = {
  analise: 'bg-blue-50 border-blue-200 text-blue-800',
  proximos_passos: 'bg-green-50 border-green-200 text-green-800',
  planos_acao: 'bg-amber-50 border-amber-200 text-amber-800',
  livre: 'bg-gray-50 border-gray-200 text-gray-700',
};

interface Props {
  tipo?: TextTipo;
  content?: string;
}

export default function TextBlockRenderer({ tipo = 'livre', content = '' }: Props) {
  return (
    <div className={`rounded-xl border p-4 ${TEXT_TIPO_COLORS[tipo]}`}>
      <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">
        {TEXT_TIPO_LABELS[tipo]}
      </p>
      <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
        {content || <span className="opacity-40 italic">Sem conteúdo</span>}
      </pre>
    </div>
  );
}
