// chartColors.ts - Paleta de cores In.Pacto para graficos

export const InpactoColors = {
  primary: {
    red: '#C0392B',
    redLight: '#E74C3C',
    redDark: '#922B21',
  },
  secondary: {
    copper: '#D35400',
    copperLight: '#E67E22',
    copperDark: '#A04000',
  },
  accent: {
    gold: '#F39C12',
    goldLight: '#F5B041',
    goldDark: '#D68910',
  },

  chartPalette: [
    '#C0392B', // Vermelho In.Pacto
    '#E67E22', // Laranja
    '#0077B5', // LinkedIn blue
    '#2C3E50', // Charcoal
    '#F39C12', // Gold
    '#27AE60', // Verde
    '#E74C3C', // Vermelho claro
    '#3498DB', // Azul claro
    '#8E44AD', // Roxo
  ],

  gradients: {
    redOrange: ['#C0392B', '#E67E22'],
    redGold: ['#C0392B', '#F39C12'],
    copperGold: ['#D35400', '#F39C12'],
    fullSpectrum: ['#C0392B', '#D35400', '#E67E22', '#F39C12', '#2C3E50', '#34495E'],
  },

  networks: {
    facebook: '#1877F2',
    instagram: '#E4405F',
    linkedin: '#0077B5',
    twitter: '#14171A',
  },

  status: {
    success: '#27AE60',
    warning: '#F39C12',
    error: '#E74C3C',
    info: '#3498DB',
  },

  gray: {
    50: '#F8F9FA',
    100: '#F1F3F5',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  }
};

export const getInpactoColor = (type: string, variant: 'primary' | 'secondary' | 'accent' = 'primary'): string => {
  switch (type) {
    case 'facebook':
    case 'alcance':
      return InpactoColors.networks.facebook;
    case 'instagram':
    case 'interacoes':
      return InpactoColors.networks.instagram;
    case 'linkedin':
    case 'impressoes':
      return InpactoColors.networks.linkedin;
    case 'twitter':
    case 'engajamento':
      return InpactoColors.networks.twitter;
    case 'curtidas':
    case 'compartilhamentos':
      return variant === 'primary' ? InpactoColors.primary.red :
        variant === 'secondary' ? InpactoColors.secondary.copper :
          InpactoColors.accent.gold;
    default:
      return InpactoColors.primary.red;
  }
};

export const getInpactoGradient = (type: 'redOrange' | 'redGold' | 'copperGold' | 'fullSpectrum'): string[] => {
  return InpactoColors.gradients[type];
};

export const getInpactoChartColors = (count: number): string[] => {
  if (count <= InpactoColors.chartPalette.length) {
    return InpactoColors.chartPalette.slice(0, count);
  }
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(InpactoColors.chartPalette[i % InpactoColors.chartPalette.length]);
  }
  return colors;
};

// Aliases para compatibilidade com codigo existente
export const MTColors = InpactoColors;
export const getMTColor = getInpactoColor;
export const getMTGradient = getInpactoGradient;
export const getMTChartColors = getInpactoChartColors;
