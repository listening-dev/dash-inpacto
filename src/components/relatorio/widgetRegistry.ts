import React from 'react';
import { WidgetDef, WidgetKey } from '../../types/relatorio';
import type {
  KpiSnapshotData, EvolucaoSnapshotRow, FormatoSnapshotRow,
  PostSnapshotRow, PlataformaSnapshotRow,
} from '../../types/relatorio';
import KpiMetricsWidget from './widgets/KpiMetricsWidget';
import EvolutionChartWidget from './widgets/EvolutionChartWidget';
import FormatDistributionWidget from './widgets/FormatDistributionWidget';
import TopPostsWidget from './widgets/TopPostsWidget';
import PlatformComparisonWidget from './widgets/PlatformComparisonWidget';
import LowPerformanceWidget from './widgets/LowPerformanceWidget';

export const WIDGET_REGISTRY: WidgetDef[] = [
  {
    key: 'kpi.metricas',
    label: 'Cards de Métricas',
    description: 'Alcance, visualizações, interações e seguidores do período',
    defaultColuna: 0,
    platforms: ['instagram', 'facebook', 'linkedin', 'twitter', 'all'],
    render: (snap) => React.createElement(KpiMetricsWidget, { snapshot: snap as KpiSnapshotData }),
  },
  {
    key: 'chart.evolucao',
    label: 'Gráfico de Evolução',
    description: 'Evolução das métricas ao longo do período selecionado',
    defaultColuna: 0,
    platforms: ['instagram', 'facebook', 'linkedin', 'twitter', 'all'],
    render: (snap) => React.createElement(EvolutionChartWidget, { snapshot: snap as EvolucaoSnapshotRow[] }),
  },
  {
    key: 'chart.formato',
    label: 'Distribuição por Formato',
    description: 'Quantidade de posts por formato (imagem, vídeo, reels, etc.)',
    defaultColuna: 1,
    platforms: ['instagram', 'facebook', 'linkedin'],
    render: (snap) => React.createElement(FormatDistributionWidget, { snapshot: snap as FormatoSnapshotRow[] }),
  },
  {
    key: 'tabela.top_posts',
    label: 'Top Posts',
    description: 'Posts com melhor desempenho em visualizações no período',
    defaultColuna: 0,
    platforms: ['instagram', 'facebook', 'linkedin', 'twitter'],
    render: (snap) => React.createElement(TopPostsWidget, { snapshot: snap as PostSnapshotRow[] }),
  },
  {
    key: 'tabela.plataformas',
    label: 'Comparativo por Plataforma',
    description: 'Métricas comparadas entre todas as plataformas',
    defaultColuna: 0,
    platforms: ['all'],
    render: (snap) => React.createElement(PlatformComparisonWidget, { snapshot: snap as PlataformaSnapshotRow[] }),
  },
  {
    key: 'tabela.baixo_desempenho',
    label: 'Posts com Baixo Desempenho',
    description: 'Posts com menor número de visualizações no período',
    defaultColuna: 0,
    platforms: ['instagram', 'facebook', 'linkedin', 'twitter'],
    render: (snap) => React.createElement(LowPerformanceWidget, { snapshot: snap as PostSnapshotRow[] }),
  },
];

export function getWidgetDef(key: WidgetKey): WidgetDef | undefined {
  return WIDGET_REGISTRY.find(w => w.key === key);
}

export const PLATFORM_LABELS: Record<string, string> = {
  all: 'Todas as plataformas',
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  twitter: 'X (Twitter)',
};
