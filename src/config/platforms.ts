// Registry central de plataformas - adicionar nova rede = adicionar 1 objeto ao array

export interface PlatformConfig {
  id: string;
  label: string;
  icon: string;
  hasFlexFixo: boolean;
  hasStories: boolean;
  /** Plataformas onde curtidas_total da tabela daily_metrics tem precedência sobre curtidas por post. */
  useCurtidasTotal: boolean;
  accentColor: string;
  chartColor: string;
  badge: string;
  postFormats: string[];
  fixoTabs?: { id: string; label: string; formats: string[] }[];
}

/**
 * Mapa de normalização de formatos: chave = valor bruto (uppercase) vindo do banco,
 * valor = nome canônico exibido na UI.
 * Adicionar novos aliases aqui — nenhuma outra mudança necessária.
 */
export const FORMAT_NORMALIZATION: Record<string, string> = {
  CAROUSEL:  'CARROSSEL',
  ALBUM:     'CARROSSEL',
  IMAGE:     'IMAGEM',
  PHOTO:     'IMAGEM',
  FOTO:      'IMAGEM',
  VIDEO:     'VÍDEO',
  REEL:      'REELS',
};

export const PLATFORMS: PlatformConfig[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    icon: '/instagram.svg',
    hasFlexFixo: true,
    hasStories: true,
    useCurtidasTotal: true,
    accentColor: '#E4405F',
    chartColor: '#E4405F',
    badge: 'IG',
    postFormats: ['IMAGE', 'CAROUSEL', 'REELS', 'VIDEO'],
    fixoTabs: [
      { id: 'conta', label: 'Conta (Geral)', formats: [] },
      { id: 'posts', label: 'Posts / Carrossel', formats: ['IMAGE', 'CAROUSEL', 'CARROSSEL', 'FOTO', 'PHOTO'] },
      { id: 'reels', label: 'Reels / Vídeos', formats: ['REELS', 'VIDEO', 'VÍDEO'] },
      { id: 'stories', label: 'Stories', formats: ['STORY'] },
    ],
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: '/facebook.svg',
    hasFlexFixo: true,
    hasStories: false,
    useCurtidasTotal: true,
    accentColor: '#1877F2',
    chartColor: '#1877F2',
    badge: 'FB',
    postFormats: ['IMAGE', 'VIDEO', 'LINK', 'CAROUSEL'],
    fixoTabs: [
      { id: 'conta', label: 'Conta (Geral)', formats: [] },
      { id: 'posts', label: 'Posts / Fotos', formats: ['IMAGE', 'PHOTO', 'FOTO', 'CAROUSEL', 'CARROSSEL', 'LINK'] },
      { id: 'videos', label: 'Vídeos', formats: ['VIDEO', 'VÍDEO'] },
    ],
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: '/linkedin.svg',
    hasFlexFixo: true,
    hasStories: false,
    useCurtidasTotal: false,
    accentColor: '#0077B5',
    chartColor: '#0077B5',
    badge: 'LI',
    postFormats: ['IMAGE', 'VIDEO', 'ARTICLE', 'LINK', 'DOCUMENT'],
    fixoTabs: [
      { id: 'conta', label: 'Conta (Geral)', formats: [] },
      { id: 'posts', label: 'Posts / Artigos', formats: ['IMAGE', 'ARTICLE', 'LINK', 'DOCUMENT', 'PHOTO'] },
      { id: 'videos', label: 'Vídeos', formats: ['VIDEO', 'VÍDEO'] },
    ],
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    icon: '/x-twitter.svg',
    hasFlexFixo: true,
    hasStories: false,
    useCurtidasTotal: false,
    accentColor: '#000000',
    chartColor: '#14171A',
    badge: 'X',
    postFormats: ['TWEET', 'RETWEET', 'THREAD', 'IMAGE', 'VIDEO'],
    fixoTabs: [
      { id: 'conta', label: 'Conta (Geral)', formats: [] },
      { id: 'tweets', label: 'Tweets', formats: ['TWEET', 'RETWEET', 'THREAD', 'TEXT'] },
      { id: 'media', label: 'Mídia', formats: ['IMAGE', 'VIDEO', 'PHOTO', 'VÍDEO'] },
    ],
  },
];

export function getPlatform(id: string): PlatformConfig | undefined {
  return PLATFORMS.find(p => p.id === id);
}

/**
 * Retorna true se a plataforma (ou qualquer plataforma, no caso de 'all')
 * usa curtidas_total da tabela daily_metrics como fonte primária de curtidas.
 */
export function platformUsesCurtidasTotal(platformId: string): boolean {
  if (platformId === 'all') return PLATFORMS.some(p => p.useCurtidasTotal);
  return getPlatform(platformId)?.useCurtidasTotal ?? false;
}

export const PLATFORM_IDS = PLATFORMS.map(p => p.id);
export const PLATFORM_LABELS: Record<string, string> = {
  all: 'Todas as plataformas',
  ...Object.fromEntries(PLATFORMS.map(p => [p.id, p.label])),
};
