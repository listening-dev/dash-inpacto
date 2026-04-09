import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { captureAllSnapshots } from '../lib/metrics';
import { RelatorioItem, WidgetKey, TextTipo } from '../types/relatorio';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRelatorioItens(relatorioId: string | undefined) {
  const [itens, setItens] = useState<RelatorioItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!relatorioId) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('relatorio_itens')
      .select('*')
      .eq('relatorio_id', relatorioId)
      .order('posicao', { ascending: true });
    if (err) setError(err.message);
    else setItens(data || []);
    setLoading(false);
  }, [relatorioId]);

  useEffect(() => { fetch(); }, [fetch]);

  const addWidgetItem = async (
    widgetKey: WidgetKey,
    config: Record<string, unknown>,
    periodoInicio: string,
    periodoFim: string,
    titulo?: string,
  ) => {
    if (!relatorioId) return;
    setError(null);
    const platform = (config.platform as string) || 'all';
    const snapshots = await captureAllSnapshots(periodoInicio, periodoFim, platform);
    const snapshot = snapshots[widgetKey] ?? null;
    const nextPos = itens.length > 0 ? Math.max(...itens.map(i => i.posicao)) + 1 : 0;
    const { data, error: err } = await supabase
      .from('relatorio_itens')
      .insert({
        relatorio_id: relatorioId,
        tipo: 'widget',
        posicao: nextPos,
        coluna: 0,
        widget_key: widgetKey,
        widget_config: config,
        widget_snapshot: snapshot,
        widget_titulo: titulo || null,
      })
      .select()
      .single();
    if (err) { setError(err.message); return; }
    setItens(prev => [...prev, data]);
  };

  const addTextItem = async (tipo: TextTipo, content: string) => {
    if (!relatorioId) return;
    setError(null);
    const nextPos = itens.length > 0 ? Math.max(...itens.map(i => i.posicao)) + 1 : 0;
    const { data, error: err } = await supabase
      .from('relatorio_itens')
      .insert({
        relatorio_id: relatorioId,
        tipo: 'text_block',
        posicao: nextPos,
        coluna: 0,
        text_tipo: tipo,
        text_content: content,
      })
      .select()
      .single();
    if (err) { setError(err.message); return; }
    setItens(prev => [...prev, data]);
  };

  const updateTextItem = async (id: string, content: string) => {
    const { error: err } = await supabase
      .from('relatorio_itens')
      .update({ text_content: content, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (err) { setError(err.message); return; }
    setItens(prev => prev.map(i => i.id === id ? { ...i, text_content: content } : i));
  };

  const deleteItem = async (id: string) => {
    const { error: err } = await supabase.from('relatorio_itens').delete().eq('id', id);
    if (err) { setError(err.message); return; }
    setItens(prev => prev.filter(i => i.id !== id));
  };

  const reorderItem = async (id: string, direction: 'up' | 'down') => {
    const sorted = [...itens].sort((a, b) => a.posicao - b.posicao);
    const idx = sorted.findIndex(i => i.id === id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const a = sorted[idx];
    const b = sorted[swapIdx];
    const posA = a.posicao;
    const posB = b.posicao;

    // Optimistic update
    setItens(prev => prev.map(i => {
      if (i.id === a.id) return { ...i, posicao: posB };
      if (i.id === b.id) return { ...i, posicao: posA };
      return i;
    }));

    const [r1, r2] = await Promise.all([
      supabase.from('relatorio_itens').update({ posicao: posB }).eq('id', a.id),
      supabase.from('relatorio_itens').update({ posicao: posA }).eq('id', b.id),
    ]);
    if (r1.error || r2.error) {
      setError(r1.error?.message || r2.error?.message || 'Erro ao reordenar');
      fetch();
    }
  };

  const updateColuna = async (id: string, coluna: 0 | 1 | 2) => {
    const { error: err } = await supabase.from('relatorio_itens').update({ coluna }).eq('id', id);
    if (err) { setError(err.message); return; }
    setItens(prev => prev.map(i => i.id === id ? { ...i, coluna } : i));
  };

  return {
    itens: [...itens].sort((a, b) => a.posicao - b.posicao),
    loading, error,
    addWidgetItem, addTextItem, updateTextItem,
    deleteItem, reorderItem, updateColuna,
    refresh: fetch,
  };
}
