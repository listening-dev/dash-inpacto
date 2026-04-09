import type React from 'react';

export interface Relatorio {
  id: string;
  user_id: string;
  titulo: string;
  descricao?: string;
  periodo_inicio?: string;
  periodo_fim?: string;
  created_at: string;
  updated_at: string;
}

export type WidgetKey =
  | 'kpi.metricas'
  | 'chart.evolucao'
  | 'chart.formato'
  | 'tabela.top_posts'
  | 'tabela.plataformas'
  | 'tabela.baixo_desempenho';

export type TextTipo = 'analise' | 'proximos_passos' | 'planos_acao' | 'livre';

export interface RelatorioItem {
  id: string;
  relatorio_id: string;
  tipo: 'widget' | 'text_block';
  posicao: number;
  coluna: 0 | 1 | 2;
  widget_key?: WidgetKey;
  widget_config?: Record<string, unknown>;
  widget_snapshot?: unknown;
  widget_titulo?: string;
  text_tipo?: TextTipo;
  text_content?: string;
  created_at: string;
  updated_at: string;
}

export interface WidgetDef {
  key: WidgetKey;
  label: string;
  description: string;
  defaultColuna: 0 | 1;
  platforms: ('instagram' | 'facebook' | 'linkedin' | 'twitter' | 'all')[];
  render: (snapshot: unknown) => React.ReactElement;
}

// Snapshot data shapes (one per widget key)
export interface KpiSnapshotData {
  alcance: number;
  visualizacoes: number;
  interacoes: number;
  novosSeguidores: number;
  totalSeguidores: number;
  engajamentoTaxa: number;
  platform: string;
}

export interface EvolucaoSnapshotRow {
  label: string;
  alcance: number;
  visualizacoes: number;
  interacoes: number;
}

export interface FormatoSnapshotRow {
  formato: string;
  count: number;
}

export interface PostSnapshotRow {
  id: string;
  titulo: string;
  formato: string;
  platform: string;
  date: string;
  thumbnail_url: string;
  permalink: string;
  visualizacoes: number;
  curtidas: number;
  comentarios: number;
  compartilhamentos: number;
  salvamentos: number;
}

export interface PlataformaSnapshotRow {
  platform: string;
  alcance: number;
  visualizacoes: number;
  interacoes: number;
  novosSeguidores: number;
  postsCount: number;
}
