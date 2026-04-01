import { useState, useEffect, useCallback } from 'react';
import { fetchMetricsBatch, aggregatePlatform } from '../lib/metrics';
import type { PlatformMetrics } from '../lib/metrics';

// Re-export all public types from metrics.ts so downstream consumers keep the
// same import paths they used before.
export type { Post, DailyRow, MonthlyRow, PlatformMetrics } from '../lib/metrics';

export type UseSupabaseDataResult = PlatformMetrics & { refetch: () => void };

/**
 * Thin wrapper around fetchMetricsBatch + aggregatePlatform.
 * Keeps the same public signature as before so all existing callers continue
 * to work without any changes.
 */
export function useSupabaseData(
    platform: string | 'all',
    startDate: string,
    endDate: string,
): UseSupabaseDataResult {
    const [retryKey, setRetryKey] = useState(0);
    const [data, setData] = useState<PlatformMetrics>({
        visualizacoes: 0, alcance: 0, interacoes: 0,
        novosSeguidores: 0, totalSeguidores: 0,
        visitasPerfil: 0, cliquesLink: 0,
        engajamentoTaxa: 0,
        curtidasTotal: 0, comentariosTotal: 0,
        compartilhamentosTotal: 0, salvamentosTotal: 0,
        postsCount: 0,
        posts: [], melhorPost: null, melhoresPosts: [], piorPost: null,
        bestDay: '-', peakTime: '-',
        monthly: [], daily: [],
        loading: true, error: null,
    });

    useEffect(() => {
        if (!startDate || !endDate) return;
        let cancelled = false;

        const run = async () => {
            setData(prev => ({ ...prev, loading: true, error: null }));
            try {
                const batch = await fetchMetricsBatch(startDate, endDate);
                if (cancelled) return;
                const metrics = aggregatePlatform(batch, platform);
                setData({ ...metrics, loading: false, error: null });
            } catch (err: unknown) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Erro ao buscar dados';
                    setData(prev => ({ ...prev, loading: false, error: message }));
                }
            }
        };

        run();
        return () => { cancelled = true; };
    }, [platform, startDate, endDate, retryKey]);

    const refetch = useCallback(() => setRetryKey(k => k + 1), []);

    return { ...data, refetch };
}
