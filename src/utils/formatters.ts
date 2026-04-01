/** Formata número com sufixos K/M para labels e textos compactos. */
export function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Math.round(n).toLocaleString('pt-BR');
}

/** Variante para cards de destaque: vírgula decimal e sufixos ' Mi'/' Mil'. */
export function fmtCard(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.', ',') + ' Mi';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace('.', ',') + ' Mil';
  return Math.round(n).toLocaleString('pt-BR');
}
