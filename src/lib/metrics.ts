import { useState, useEffect } from 'react';
import { supabase as defaultClient } from './supabaseClient';
import type { KpiSnapshotData, EvolucaoSnapshotRow, FormatoSnapshotRow, PostSnapshotRow, PlataformaSnapshotRow } from '../types/relatorio';

// ─── Re-exported public types ────────────────────────────────────────────────

export interface Post {
    id: string;
    platform: string;
    external_id: string;
    date: string;
    formato: string;
    titulo: string;
    thumbnail_url: string;
    permalink: string;
    visualizacoes: number;
    curtidas: number;
    comentarios: number;
    compartilhamentos: number;
    salvamentos: number;
    tipo_post?: string;
    reactions?: number;
}

export interface DailyRow {
    date: string;
    platform: string;
    alcance: number;
    visualizacoes: number;
    interacoes: number;
    novos_seguidores: number;
    total_seguidores: number;
    visitas_perfil: number;
    cliques_link: number;
    posts_count: number;
}

export interface MonthlyRow {
    mes: string;
    ano: string;
    date: string;
    alcance: number;
    visualizacoes: number;
    interacoes: number;
    novosSeguidores: number;
    totalSeguidores: number;
    visitasPerfil: number;
    cliquesLink: number;
    postsCount: number;
}

export interface PlatformMetrics {
    visualizacoes: number;
    alcance: number;
    interacoes: number;
    novosSeguidores: number;
    totalSeguidores: number;
    visitasPerfil: number;
    cliquesLink: number;
    engajamentoTaxa: number;
    curtidasTotal: number;
    comentariosTotal: number;
    compartilhamentosTotal: number;
    salvamentosTotal: number;
    postsCount: number;
    posts: Post[];
    melhorPost: Post | null;
    melhoresPosts: Post[];
    piorPost: Post | null;
    bestDay: string;
    peakTime: string;
    monthly: MonthlyRow[];
    daily: DailyRow[];
    loading: boolean;
    error: string | null;
}

// ─── Raw row types (shapes of DB rows) ───────────────────────────────────────

export interface RawMetricRow {
    date: string;
    platform: string;
    alcance: number;
    visualizacoes: number;
    interacoes: number;
    novos_seguidores: number;
    total_seguidores: number;
    visitas_perfil: number;
    cliques_link: number;
    posts_count: number;
    curtidas_total?: number;
    [key: string]: unknown;
}

export interface RawPostRow {
    id: string;
    platform: string;
    external_id?: string;
    date: string;
    formato?: string;
    titulo?: string;
    thumbnail_url?: string;
    permalink?: string;
    visualizacoes?: number;
    curtidas?: number;
    comentarios?: number;
    compartilhamentos?: number;
    salvamentos?: number;
    tipo_post?: string;
    reactions?: number;
    [key: string]: unknown;
}

export interface RawStoryRow {
    id?: string;
    external_id?: string;
    date?: string;
    created_at?: string;
    impressoes?: number;
    alcance?: number;
    respostas?: number;
    toques_frente?: number;
    toques_atras?: number;
    saidas?: number;
    [key: string]: unknown;
}

// ─── Fetched payload ──────────────────────────────────────────────────────────

export interface MetricsBatch {
    metrics: RawMetricRow[];
    posts: RawPostRow[];
    stories: RawStoryRow[];
    /** platform → latest known total_seguidores (ordered desc, first occurrence per platform) */
    latestFollowersByPlatform: Record<string, number>;
    startDate: string;
    endDate: string;
    latestDataDate: string;
}

// ─── Hook return type ─────────────────────────────────────────────────────────

export interface AllPlatformMetrics {
    all: Omit<PlatformMetrics, 'loading' | 'error'>;
    byPlatform: Record<string, Omit<PlatformMetrics, 'loading' | 'error'>>;
    loading: boolean;
    error: string | null;
    latestDataDate: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const MES_LABELS: Record<number, string> = {
    1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr',
    5: 'Mai', 6: 'Jun', 7: 'Jul', 8: 'Ago',
    9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez',
};

// ─── Empty metrics helper ─────────────────────────────────────────────────────

function emptyMetrics(): Omit<PlatformMetrics, 'loading' | 'error'> {
    return {
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
    };
}

// ─── Batch fetch cache ────────────────────────────────────────────────────────
// Deduplicates identical fetches within 30 s — dashboard and snapshot callers
// share one round-trip instead of firing N independent requests.
const _batchCache = new Map<string, { data: MetricsBatch; ts: number }>();
const BATCH_CACHE_TTL_MS = 30_000;

// ─── fetchMetricsBatch ────────────────────────────────────────────────────────

/**
 * Fetches all raw data from Supabase for the given date range (all platforms).
 * The optional `client` parameter defaults to the singleton from supabaseClient.ts.
 */
export async function fetchMetricsBatch(
    startDate: string,
    endDate: string,
    client: typeof defaultClient = defaultClient,
): Promise<MetricsBatch> {
    // Cache: only for the default client — tests pass a custom client to bypass
    const _ck = `${startDate}|${endDate}`;
    if (client === defaultClient) {
        const _hit = _batchCache.get(_ck);
        if (_hit && Date.now() - _hit.ts < BATCH_CACHE_TTL_MS) return _hit.data;
    }

    // 1. Parallel: daily_metrics, posts, latestFollowers
    const [metricsResult, postsResult, fbResult] = await Promise.all([
        client
            .from('daily_metrics')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true }),

        client
            .from('posts')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('visualizacoes', { ascending: false }),

        client
            .from('daily_metrics')
            .select('platform, total_seguidores')
            .gt('total_seguidores', 0)
            .lte('date', endDate)
            .order('date', { ascending: false })
            .limit(30),
    ]);

    if (metricsResult.error) throw metricsResult.error;
    if (postsResult.error) throw postsResult.error;

    // Build latestFollowersByPlatform (first occurrence per platform = latest, since ordered desc)
    const latestFollowersByPlatform: Record<string, number> = {};
    if (fbResult.data) {
        fbResult.data.forEach((d: { platform: string; total_seguidores: number }) => {
            if (!latestFollowersByPlatform[d.platform]) {
                latestFollowersByPlatform[d.platform] = d.total_seguidores;
            }
        });
    }

    // 2. Stories with 2-phase fallback (date filter first, JS fallback if empty)
    let storiesData: RawStoryRow[] = [];
    const { data: st, error: stEr } = await client
        .from('stories')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate + 'T23:59:59+00:00');

    if (stEr) {
        console.error('[InPacto] Stories fetch error (verifique permissões RLS da tabela stories):', stEr);
    } else if (st && st.length > 0) {
        storiesData = st as RawStoryRow[];
    } else {
        // Fallback: date pode ser null ou ter fuso divergente — busca sem filtro de data e filtra em JS
        const { data: stAll, error: stAllErr } = await client
            .from('stories')
            .select('*')
            .limit(1000);
        if (stAllErr) {
            console.error('[InPacto] Stories fallback error:', stAllErr);
        } else if (stAll) {
            storiesData = (stAll as RawStoryRow[]).filter(s => {
                const d = ((s.date || s.created_at) || '').substring(0, 10);
                return d >= startDate && d <= endDate;
            });
        }
    }

    const metricsData = (metricsResult.data || []) as RawMetricRow[];
    const latestDataDate = metricsData.reduce(
        (max: string, r: RawMetricRow) => (r.date > max ? r.date : max),
        '',
    );

    const _result: MetricsBatch = {
        metrics: metricsData,
        posts: (postsResult.data || []) as RawPostRow[],
        stories: storiesData,
        latestFollowersByPlatform,
        startDate,
        endDate,
        latestDataDate,
    };
    if (client === defaultClient) _batchCache.set(_ck, { data: _result, ts: Date.now() });
    return _result;
}

// ─── aggregatePlatform ────────────────────────────────────────────────────────

/**
 * Pure function — no I/O.
 * Aggregates raw batch data for the given platform.
 * Pass platform === 'all' to aggregate across all platforms.
 */
export function aggregatePlatform(
    batch: MetricsBatch,
    platform: string,
): Omit<PlatformMetrics, 'loading' | 'error'> {
    const { startDate, endDate, latestFollowersByPlatform } = batch;

    // Filter metrics rows
    const rows: RawMetricRow[] = platform === 'all'
        ? batch.metrics
        : batch.metrics.filter(r => r.platform === platform);

    // Filter posts rows
    const filteredRawPosts: RawPostRow[] = platform === 'all'
        ? batch.posts
        : batch.posts.filter(p => p.platform === platform);

    // Include stories only for instagram or all
    const includeStories = platform === 'instagram' || platform === 'all';

    // Build story Post objects
    const storyList: Post[] = includeStories
        ? batch.stories.map(s => ({
            id: (s.id as string) || Math.random().toString(),
            platform: 'instagram',
            external_id: (s.external_id as string) || '',
            date: s.date as string,
            formato: 'STORY',
            titulo: 'Story Instagram (expirado)',
            thumbnail_url: '',
            permalink: '',
            visualizacoes: s.impressoes || 0,
            curtidas: 0,
            comentarios: s.respostas || 0,
            compartilhamentos: ((s.toques_frente || 0) + (s.toques_atras || 0) + (s.saidas || 0)),
            salvamentos: 0,
            alcance: s.alcance || 0,
        } as Post))
        : [];

    // Normalize formats and build full post list
    const postList: Post[] = [
        ...filteredRawPosts.map(p => {
            let fmt = (p.formato?.toUpperCase()) || 'OUTROS';
            if (fmt === 'CAROUSEL' || fmt === 'ALBUM') fmt = 'CARROSSEL';
            else if (fmt === 'IMAGE' || fmt === 'PHOTO') fmt = 'IMAGEM';
            else if (fmt === 'VIDEO') fmt = 'VÍDEO';
            else if (fmt === 'REEL') fmt = 'REELS';
            return { ...p, formato: fmt } as Post;
        }),
        ...storyList,
    ];

    // Aggregate basic metrics from daily_metrics rows
    const visualizacoes = rows.reduce((s, r) => s + (r.visualizacoes || 0), 0);
    const alcance = rows.reduce((s, r) => s + (r.alcance || 0), 0);
    const interacoes = rows.reduce((s, r) => s + (r.interacoes || 0), 0);
    const novosSeguidores = rows.reduce((s, r) => s + (r.novos_seguidores || 0), 0);
    const visitasPerfil = rows.reduce((s, r) => s + (r.visitas_perfil || 0), 0);
    const cliquesLink = rows.reduce((s, r) => s + (r.cliques_link || 0), 0);

    const curtidasTotal = postList.reduce((s, p) => s + (p.curtidas || 0), 0);
    const comentariosTotal = postList.reduce((s, p) => s + (p.comentarios || 0), 0);
    const compartilhamentosTotal = postList.reduce((s, p) => s + (p.compartilhamentos || 0), 0);
    const salvamentosTotal = postList.reduce((s, p) => s + (p.salvamentos || 0), 0);

    const dbPostsCount = rows.reduce((s, r) => s + (r.posts_count || 0), 0);
    const postsCount = dbPostsCount > 0 ? dbPostsCount : postList.filter(p => p.formato !== 'STORY').length;

    const engajamentoTaxa = alcance > 0 ? (interacoes / alcance) * 100 : 0;

    // totalSeguidores with 3-strategy fallback
    const totalSeguidores = (() => {
        if (platform === 'all') {
            const byPlatformMap: Record<string, number> = {};
            rows.forEach(r => { if (r.total_seguidores > 0) byPlatformMap[r.platform] = r.total_seguidores; });
            const periodSum = Object.values(byPlatformMap).reduce((s, v) => s + v, 0);
            if (periodSum > 0) return periodSum;
            // Fallback to sum of latestFollowersByPlatform
            return Object.values(latestFollowersByPlatform).reduce((a, b) => a + b, 0);
        }
        // Specific platform: reverse find in period rows first
        const lastRowWithSeg = [...rows].reverse().find(r => r.total_seguidores > 0);
        if (lastRowWithSeg) return lastRowWithSeg.total_seguidores;
        // Fallback to latestFollowersByPlatform[platform]
        return latestFollowersByPlatform[platform] || 0;
    })();

    // Likes arbitration (curtidas_total preference for facebook/instagram/all)
    let finalLikes = curtidasTotal;
    let finalComments = comentariosTotal;
    let finalShares = compartilhamentosTotal;

    if (platform === 'facebook' || platform === 'instagram') {
        finalComments = postList.reduce((acc, p) => acc + (p.comentarios || 0), 0);
        finalShares = postList.reduce((acc, p) => acc + (p.compartilhamentos || 0), 0);
        const likesFromMetrics = rows.reduce((s, r) => s + ((r.curtidas_total as number) || 0), 0);
        const likesFromPosts = postList.reduce((acc, p) => acc + (p.curtidas || 0), 0);
        finalLikes = likesFromMetrics > 0 ? likesFromMetrics : likesFromPosts;
    } else if (platform === 'all') {
        finalComments = postList.reduce((acc, p) => acc + (p.comentarios || 0), 0);
        finalShares = postList.reduce((acc, p) => acc + (p.compartilhamentos || 0), 0);
        const likesFromMetrics = rows.reduce((s, r) => s + ((r.curtidas_total as number) || 0), 0);
        const likesFromPosts = postList.reduce((acc, p) => acc + (p.curtidas || 0), 0);
        finalLikes = likesFromMetrics > 0 ? likesFromMetrics : likesFromPosts;
    }

    // Best / worst posts
    const validPosts = postList.filter(p => p.visualizacoes > 0 && p.formato !== 'STORY');
    const melhorPost = validPosts[0] || null;
    const melhoresPosts = validPosts.slice(0, 3);
    const piorPost = validPosts.length > 1
        ? [...validPosts].sort((a, b) => a.visualizacoes - b.visualizacoes)[0]
        : null;

    // bestDay and peakTime (scoring algorithm)
    let bestDay = '-';
    let peakTime = '-';

    if (validPosts.length > 0) {
        const dayCounts: Record<number, number> = {};
        const hourCounts: Record<number, number> = {};
        validPosts.forEach(p => {
            const d = new Date(p.date);
            if (!isNaN(d.getTime())) {
                const postInteractions = (p.curtidas || 0) + (p.comentarios || 0) + (p.compartilhamentos || 0) + (p.salvamentos || 0);
                const score = (p.visualizacoes || 0) + postInteractions;
                dayCounts[d.getDay()] = (dayCounts[d.getDay()] || 0) + score;
                hourCounts[d.getHours()] = (hourCounts[d.getHours()] || 0) + score;
            }
        });

        const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const topDay = Object.keys(dayCounts).length > 0
            ? parseInt(Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0][0])
            : 3;
        bestDay = daysOfWeek[topDay];

        const topHour = Object.keys(hourCounts).length > 0
            ? parseInt(Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0][0])
            : 12;
        peakTime = `${topHour}h - ${topHour + 2}h`;
    }

    // Monthly aggregation
    const monthMap: Record<string, MonthlyRow> = {};
    rows.forEach(r => {
        const d = new Date(r.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthMap[key]) {
            monthMap[key] = {
                mes: MES_LABELS[d.getMonth() + 1], ano: String(d.getFullYear()), date: key,
                alcance: 0, visualizacoes: 0, interacoes: 0,
                novosSeguidores: 0, totalSeguidores: 0,
                visitasPerfil: 0, cliquesLink: 0, postsCount: 0,
            };
        }
        monthMap[key].alcance += r.alcance || 0;
        monthMap[key].visualizacoes += r.visualizacoes || 0;
        monthMap[key].interacoes += r.interacoes || 0;
        monthMap[key].novosSeguidores += r.novos_seguidores || 0;
        monthMap[key].totalSeguidores = r.total_seguidores || monthMap[key].totalSeguidores;
        monthMap[key].visitasPerfil += r.visitas_perfil || 0;
        monthMap[key].cliquesLink += r.cliques_link || 0;
        monthMap[key].postsCount += r.posts_count || 0;
    });

    const startMonthPrefix = startDate.substring(0, 7);
    const endMonthPrefix = endDate.substring(0, 7);

    const monthly = Object.values(monthMap)
        .filter(m => m.date >= startMonthPrefix && m.date <= endMonthPrefix)
        .sort((a, b) => a.date.localeCompare(b.date));

    // Daily rows
    const daily: DailyRow[] = rows.map(r => ({
        date: r.date,
        platform: r.platform,
        alcance: r.alcance || 0,
        visualizacoes: r.visualizacoes || 0,
        interacoes: r.interacoes || 0,
        novos_seguidores: r.novos_seguidores || 0,
        total_seguidores: r.total_seguidores || 0,
        visitas_perfil: r.visitas_perfil || 0,
        cliques_link: r.cliques_link || 0,
        posts_count: r.posts_count || 0,
    }));

    return {
        visualizacoes,
        alcance,
        interacoes,
        novosSeguidores,
        totalSeguidores,
        visitasPerfil,
        cliquesLink,
        engajamentoTaxa,
        curtidasTotal: finalLikes,
        comentariosTotal: finalComments,
        compartilhamentosTotal: finalShares,
        salvamentosTotal,
        postsCount,
        posts: postList,
        melhorPost,
        melhoresPosts,
        piorPost,
        bestDay,
        peakTime,
        monthly,
        daily,
    };
}

// ─── WidgetSnapshotMap & captureAllSnapshots ──────────────────────────────────

/** Strongly-typed map of widget key → snapshot payload. */
export interface WidgetSnapshotMap {
    'kpi.metricas': KpiSnapshotData;
    'chart.evolucao': EvolucaoSnapshotRow[];
    'chart.formato': FormatoSnapshotRow[];
    'tabela.top_posts': PostSnapshotRow[];
    'tabela.baixo_desempenho': PostSnapshotRow[];
    'tabela.plataformas': PlataformaSnapshotRow[];
}

const _SNAPSHOT_PLATFORMS = ['instagram', 'facebook', 'linkedin', 'twitter'] as const;

/**
 * Fetches once and projects all six widget snapshots in a single Supabase
 * round-trip. Subsequent calls within BATCH_CACHE_TTL_MS for the same date
 * range reuse the cached batch — no extra network requests.
 */
export async function captureAllSnapshots(
    periodoInicio: string,
    periodoFim: string,
    platform: string,
    client: typeof defaultClient = defaultClient,
): Promise<WidgetSnapshotMap> {
    const batch = await fetchMetricsBatch(periodoInicio, periodoFim, client);
    const m = aggregatePlatform(batch, platform);

    // kpi.metricas
    const kpiMetricas: KpiSnapshotData = {
        alcance: m.alcance,
        visualizacoes: m.visualizacoes,
        interacoes: m.interacoes,
        novosSeguidores: m.novosSeguidores,
        totalSeguidores: m.totalSeguidores,
        engajamentoTaxa: m.engajamentoTaxa,
        platform,
    };

    // chart.evolucao — group daily rows by date
    const _byDate: Record<string, EvolucaoSnapshotRow> = {};
    m.daily.forEach(r => {
        if (!_byDate[r.date]) _byDate[r.date] = { label: r.date, alcance: 0, visualizacoes: 0, interacoes: 0 };
        _byDate[r.date].alcance += r.alcance || 0;
        _byDate[r.date].visualizacoes += r.visualizacoes || 0;
        _byDate[r.date].interacoes += r.interacoes || 0;
    });
    const evolucao: EvolucaoSnapshotRow[] = Object.values(_byDate);

    // chart.formato — count posts by normalized format (excluding STORYs)
    const _counts: Record<string, number> = {};
    m.posts.forEach(p => {
        if (p.formato === 'STORY') return;
        _counts[p.formato] = (_counts[p.formato] || 0) + 1;
    });
    const formato: FormatoSnapshotRow[] = Object.entries(_counts).map(([fmt, count]) => ({ formato: fmt, count }));

    // tabela.top_posts
    const topPosts = m.posts
        .filter(p => p.formato !== 'STORY')
        .sort((a, b) => (b.visualizacoes || 0) - (a.visualizacoes || 0))
        .slice(0, 5) as PostSnapshotRow[];

    // tabela.baixo_desempenho
    const lowPosts = m.posts
        .filter(p => p.formato !== 'STORY' && (p.visualizacoes || 0) > 0)
        .sort((a, b) => (a.visualizacoes || 0) - (b.visualizacoes || 0))
        .slice(0, 5) as PostSnapshotRow[];

    // tabela.plataformas — always per-platform regardless of caller's `platform`
    const plataformas: PlataformaSnapshotRow[] = _SNAPSHOT_PLATFORMS
        .map(pid => {
            const pm = aggregatePlatform(batch, pid);
            return {
                platform: pid,
                alcance: pm.alcance,
                visualizacoes: pm.visualizacoes,
                interacoes: pm.interacoes,
                novosSeguidores: pm.novosSeguidores,
                postsCount: pm.postsCount,
            };
        })
        .filter(r => r.alcance > 0 || r.visualizacoes > 0 || r.postsCount > 0);

    return {
        'kpi.metricas': kpiMetricas,
        'chart.evolucao': evolucao,
        'chart.formato': formato,
        'tabela.top_posts': topPosts,
        'tabela.baixo_desempenho': lowPosts,
        'tabela.plataformas': plataformas,
    };
}

// ─── useMetricsBatch hook ─────────────────────────────────────────────────────

const PLATFORMS_TO_AGGREGATE = ['instagram', 'facebook', 'linkedin', 'twitter'] as const;

/**
 * Fetches once via fetchMetricsBatch and aggregates for all platforms + 'all'.
 */
export function useMetricsBatch(startDate: string, endDate: string): AllPlatformMetrics {
    const [state, setState] = useState<AllPlatformMetrics>({
        all: emptyMetrics(),
        byPlatform: {
            instagram: emptyMetrics(),
            facebook: emptyMetrics(),
            linkedin: emptyMetrics(),
            twitter: emptyMetrics(),
        },
        loading: true,
        error: null,
        latestDataDate: '',
    });

    useEffect(() => {
        if (!startDate || !endDate) return;
        let cancelled = false;

        const run = async () => {
            setState(prev => ({ ...prev, loading: true, error: null }));
            try {
                const batch = await fetchMetricsBatch(startDate, endDate);
                if (cancelled) return;

                const allMetrics = aggregatePlatform(batch, 'all');
                const byPlatform: Record<string, Omit<PlatformMetrics, 'loading' | 'error'>> = {};
                for (const p of PLATFORMS_TO_AGGREGATE) {
                    byPlatform[p] = aggregatePlatform(batch, p);
                }

                setState({
                    all: allMetrics,
                    byPlatform,
                    loading: false,
                    error: null,
                    latestDataDate: batch.latestDataDate,
                });
            } catch (err: unknown) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'Erro ao buscar dados';
                    setState(prev => ({ ...prev, loading: false, error: message }));
                }
            }
        };

        run();
        return () => { cancelled = true; };
    }, [startDate, endDate]);

    return state;
}

/** Preferred alias for useMetricsBatch — use this in new callers. */
export const useMetrics = useMetricsBatch;
