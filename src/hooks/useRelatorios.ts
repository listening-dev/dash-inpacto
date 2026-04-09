import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Relatorio } from '../types/relatorio';

export function useRelatorios(userId: string | undefined) {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('relatorios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setRelatorios(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const createRelatorio = async (titulo: string, periodoInicio?: string, periodoFim?: string): Promise<Relatorio | null> => {
    if (!userId) return null;
    const { data, error: err } = await supabase
      .from('relatorios')
      .insert({ user_id: userId, titulo, periodo_inicio: periodoInicio || null, periodo_fim: periodoFim || null })
      .select()
      .single();
    if (err) { setError(err.message); return null; }
    setRelatorios(prev => [data, ...prev]);
    return data;
  };

  const updateRelatorio = async (id: string, fields: Partial<Pick<Relatorio, 'titulo' | 'descricao' | 'periodo_inicio' | 'periodo_fim'>>) => {
    const { error: err } = await supabase
      .from('relatorios')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (err) { setError(err.message); return; }
    setRelatorios(prev => prev.map(r => r.id === id ? { ...r, ...fields } : r));
  };

  const deleteRelatorio = async (id: string) => {
    const { error: err } = await supabase.from('relatorios').delete().eq('id', id);
    if (err) { setError(err.message); return; }
    setRelatorios(prev => prev.filter(r => r.id !== id));
  };

  return { relatorios, loading, error, createRelatorio, updateRelatorio, deleteRelatorio, refresh: fetch };
}
