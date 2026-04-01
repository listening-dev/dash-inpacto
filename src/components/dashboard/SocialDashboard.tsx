import React, { useState, useMemo, useEffect } from 'react';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import DataTable from './DataTable';
import { MetricTooltip } from '../ui/MetricTooltip';
import { useSupabaseData, Post } from '../../hooks/useSupabaseData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { differenceInDays, parseISO, format, addDays } from 'date-fns';
import { TrendingUp, Eye, Heart, MessageCircle, Share2, Users, HeartHandshake } from 'lucide-react';
import { getPlatform } from '../../config/platforms';
import { fmtNum } from '../../utils/formatters';

interface SocialDashboardProps {
    platform: 'instagram' | 'facebook' | 'linkedin' | 'twitter';
    mode: 'flexivel' | 'fixo';
    startDate?: string;
    endDate?: string;
    setStartDate?: (date: string) => void;
    setEndDate?: (date: string) => void;
}

export const SocialDashboard: React.FC<SocialDashboardProps> = ({
    platform,
    mode,
    startDate = '2025-08-01',
    endDate = '2026-02-28',
    setStartDate,
    setEndDate,
}) => {
    const platformConfig = getPlatform(platform);

    // Dynamic styles derived from PLATFORMS config
    const styles = {
        icon: <img src={platformConfig?.icon || '/instagram.svg'} alt={platformConfig?.label || platform} className="w-5 h-5" />,
        text: platformConfig?.label || platform,
        gradFrom: 'from-[#C0392B]',
        gradTo: 'to-[#E67E22]',
        accent: platformConfig?.accentColor || '#C0392B',
        badge: platformConfig?.badge || '',
    };

    const flexTabs = [
        { id: 'geral', label: 'Performance Geral' },
        { id: 'posts', label: 'Posts & Formatos' },
        { id: 'melhor', label: 'Melhor Post' },
        { id: 'pior', label: 'Baixo Desempenho' }
    ];

    // Read fixoTabs from platform config instead of hardcoding
    const fixoTabs = (platformConfig?.fixoTabs || []).map(t => ({
        id: t.id,
        label: t.label,
    }));

    const tabs = mode === 'flexivel' ? flexTabs : fixoTabs;
    const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'geral');
    const [sortField, setSortField] = useState<keyof Post>('visualizacoes');
    const [melhorPostIndex, setMelhorPostIndex] = useState(0);

    useEffect(() => {
        setMelhorPostIndex(0);
    }, [platform, startDate, endDate]);

    const sb = useSupabaseData(platform, startDate, endDate);

    // Platform-specific metric helpers
    const getPlatformEmoji = () => {
        switch (platform) {
            case 'instagram': return '📷';
            case 'facebook': return '👥';
            case 'linkedin': return '💼';
            case 'twitter': return '🐦';
            default: return '📱';
        }
    };

    /** Returns the label for the "shares" column depending on platform */
    const getSharesLabel = () => {
        if (platform === 'twitter') return 'Retweets';
        return 'Compartilhamentos';
    };

    /** Returns the label for the "saves" / secondary metric slot depending on platform */
    const getSavesLabel = () => {
        if (platform === 'twitter') return 'Favoritos';
        if (platform === 'linkedin') return 'Cliques';
        return 'Salvamentos';
    };

    const DatePickerInputs = () => (
        <div className="flex items-center gap-3">
            <input type="date" value={startDate}
                onChange={(e) => setStartDate && setStartDate(e.target.value)}
                className="border border-gray-200 rounded-lg p-2 text-sm font-medium bg-gray-50 text-gray-700 cursor-pointer focus:ring-2 focus:ring-orange-200 focus:outline-none" />
            <span className="text-gray-400 font-medium">ate</span>
            <input type="date" value={endDate}
                onChange={(e) => setEndDate && setEndDate(e.target.value)}
                className="border border-gray-200 rounded-lg p-2 text-sm font-medium bg-gray-50 text-gray-700 cursor-pointer focus:ring-2 focus:ring-orange-200 focus:outline-none" />
        </div>
    );

    // Derive format distribution from real posts
    const formatCounts: Record<string, number> = {};
    sb.posts.forEach(p => {
        const f = p.formato || 'Outro';
        formatCounts[f] = (formatCounts[f] || 0) + 1;
    });
    const formatosData = Object.entries(formatCounts)
        .map(([name, value]) => ({ name, value, color: '#4b4b4b' }))
        .sort((a, b) => b.value - a.value);

    // Evolution chart data (Monthly vs Daily)
    const formatDisplayDate = (d: string) => {
        if (!d) return '';
        const [y, m, day] = d.split('-');
        return `${day}/${m}/${y}`;
    };

    const isShortPeriod = useMemo(() => {
        try {
            return differenceInDays(parseISO(endDate), parseISO(startDate)) <= 30;
        } catch {
            return false;
        }
    }, [startDate, endDate]);

    const monthlyChartData = useMemo(() => {
        return sb.monthly.map(m => ({
            name: `${m.mes}/${m.ano.slice(2)}`,
            Alcance: m.alcance,
            Interacoes: m.interacoes,
        }));
    }, [sb.monthly]);

    const dailyChartData = useMemo(() => {
        const dateMap: Record<string, { Alcance: number; Interacoes: number }> = {};
        sb.daily.forEach(d => {
            if (!dateMap[d.date]) dateMap[d.date] = { Alcance: 0, Interacoes: 0 };
            dateMap[d.date].Alcance += d.alcance || 0;
            dateMap[d.date].Interacoes += d.interacoes || 0;
        });
        const result: { name: string; Alcance: number; Interacoes: number }[] = [];
        let current = parseISO(startDate);
        const end = parseISO(endDate);
        while (current <= end) {
            const key = format(current, 'yyyy-MM-dd');
            result.push({ name: formatDisplayDate(key), ...(dateMap[key] ?? { Alcance: 0, Interacoes: 0 }) });
            current = addDays(current, 1);
        }
        return result;
    }, [sb.daily, startDate, endDate]);

    const chartDataToUse = isShortPeriod ? dailyChartData : monthlyChartData;
    const rangeDays = differenceInDays(parseISO(endDate), parseISO(startDate));
    const chartTitle = isShortPeriod ? `Evolucao Diaria (${rangeDays} dias)` : `Evolucao Mensal (${chartDataToUse.length} meses)`;

    // Top 5 and Worst 5 posts based on sort metric
    const top5Posts = useMemo(() => {
        let list = [...sb.posts].filter(p => p.formato !== 'STORY' && p.tipo_post !== 'STORY');
        return list
            .sort((a, b) => (Number(b[sortField]) || 0) - (Number(a[sortField]) || 0))
            .slice(0, 5);
    }, [sb.posts, sortField]);

    const worst5Posts = useMemo(() => {
        let list = [...sb.posts].filter(p => p.formato !== 'STORY' && p.tipo_post !== 'STORY');
        return list
            .sort((a, b) => (Number(a[sortField]) || 0) - (Number(b[sortField]) || 0))
            .slice(0, 5);
    }, [sb.posts, sortField]);

    const getFallbackTitle = (f?: string) => {
        if (!f) return 'Post sem descricao';
        return `${f.charAt(0).toUpperCase() + f.slice(1).toLowerCase()} sem descricao`;
    };

    const getMetricLabel = () => {
        switch (sortField) {
            case 'curtidas': return 'Curtidas';
            case 'comentarios': return 'Comentarios';
            case 'compartilhamentos': return getSharesLabel();
            default: return 'Visualizacoes';
        }
    };

    const ThSortable = ({ field, label, tooltip }: { field: keyof Post; label: string; tooltip?: string }) => {
        const isActive = sortField === field;
        return (
            <th onClick={() => setSortField(field)}
                className={`text-right px-6 py-3 text-xs font-bold uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none ${isActive ? 'text-gray-900 border-b-2 border-gray-400' : 'text-gray-500'}`}>
                <span className="inline-flex items-center justify-end gap-0">
                    {label} {isActive && '\uD83D\uDD3B'}
                    {tooltip && <MetricTooltip metric={tooltip} />}
                </span>
            </th>
        );
    };

    const PostCard = ({ post, label, themeColor }: { post: Post; label: string; themeColor: string }) => (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm animate-fadeIn">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <span className="mr-3 text-xl">{label === 'Melhor Post' ? '\uD83C\uDFC6' : '\uD83D\uDCC9'}</span>
                    {label === 'Pior Post' ? 'Baixo Desempenho' : label}
                    <span className="text-gray-400 text-sm font-normal ml-2">({post.formato || 'Post'})</span>
                </h2>
            </div>
            <div className="flex flex-col md:flex-row gap-6 p-6">
                <a href={post.permalink || post.external_id || '#'}
                    target="_blank" rel="noreferrer"
                    title="Visualizar post na rede social"
                    className={`w-full md:w-1/3 rounded-xl overflow-hidden p-3 border border-gray-100 shadow-sm ${themeColor} group hover:shadow-md transition-all cursor-pointer block ${!(post.permalink || post.external_id) ? 'pointer-events-none' : ''}`}>
                    <div className="rounded-lg overflow-hidden border border-gray-200 relative bg-gray-100 min-h-[150px] flex items-center justify-center">
                        {post.thumbnail_url && post.thumbnail_url.startsWith('http') ? (
                            <img src={post.thumbnail_url} alt="Thumbnail do post"
                                onError={(e) => {
                                    const target = e.currentTarget;
                                    target.onerror = null;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                        const icon = document.createElement('div');
                                        icon.innerHTML = getPlatformEmoji();
                                        icon.className = 'text-5xl opacity-20';
                                        parent.appendChild(icon);
                                    }
                                }}
                                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300 min-h-[150px]" />
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-4xl opacity-20">{getPlatformEmoji()}</span>
                                <span className="text-gray-400 font-medium text-xs">Sem midia disponivel</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="bg-white text-gray-800 text-sm font-bold py-2 px-4 rounded-full opacity-0 group-hover:opacity-100 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                                Ver Post \u2197
                            </span>
                        </div>
                    </div>
                    {post.titulo && <p className="mt-3 text-sm text-gray-700 line-clamp-3 leading-relaxed">{post.titulo}</p>}
                    {!post.titulo && <p className="mt-3 text-sm text-gray-400 line-clamp-3 leading-relaxed italic">{getFallbackTitle(post.formato)}</p>}
                </a>

                <div className="w-full md:w-2/3 grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="p-3 rounded-lg hover:bg-white transition-colors">
                        <span className="inline-flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Visualizacoes<MetricTooltip metric="visualizacoes" /></span>
                        <span className="block text-2xl font-bold text-gray-900">{fmtNum(post.visualizacoes)}</span>
                    </div>
                    {/* Curtidas - show for all platforms except facebook */}
                    {platform !== 'facebook' && (
                        <div className="p-3 rounded-lg hover:bg-white transition-colors">
                            <span className="inline-flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Curtidas<MetricTooltip metric="curtidas" /></span>
                            <span className="block text-xl font-semibold text-gray-800">{fmtNum(post.curtidas)}</span>
                        </div>
                    )}
                    <div className="p-3 rounded-lg hover:bg-white transition-colors">
                        <span className="inline-flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Interacoes<MetricTooltip metric="interacoes" /></span>
                        <span className="block text-2xl font-bold text-gray-900">{fmtNum((post.curtidas || 0) + (post.comentarios || 0) + (post.compartilhamentos || 0) + (post.salvamentos || 0))}</span>
                    </div>
                    <div className="p-3 rounded-lg hover:bg-white transition-colors">
                        <span className="inline-flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Comentarios<MetricTooltip metric="comentarios" /></span>
                        <span className="block text-xl font-semibold text-gray-800">{fmtNum(post.comentarios)}</span>
                    </div>
                    <div className="p-3 rounded-lg hover:bg-white transition-colors">
                        <span className="inline-flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{getSharesLabel()}<MetricTooltip metric="compartilhamentos" /></span>
                        <span className="block text-xl font-semibold text-gray-800">{fmtNum(post.compartilhamentos)}</span>
                    </div>
                    {platform === 'facebook' ? (
                        <div className="p-3 rounded-lg hover:bg-white transition-colors">
                            <span className="inline-flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Reacoes<MetricTooltip metric="reacoes" /></span>
                            <span className="block text-xl font-semibold text-gray-800">{fmtNum(post.reactions || 0)}</span>
                        </div>
                    ) : (
                        <div className="p-3 rounded-lg hover:bg-white transition-colors">
                            <span className="inline-flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{getSavesLabel()}<MetricTooltip metric="salvamentos" /></span>
                            <span className="block text-xl font-semibold text-gray-800">{fmtNum(post.salvamentos)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderFlexivel = () => {
        if (sb.loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando dados...</div>;
        if (sb.error) return <div className="flex items-center justify-center h-64 text-red-500">Erro: {sb.error}</div>;

        if (activeTab === 'geral') {
            return (
                <div className="space-y-6 animate-fadeIn">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <span className="font-semibold text-gray-700 uppercase tracking-wide text-sm">Periodo Selecionado:</span>
                        <DatePickerInputs />
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { label: 'Seguidores', value: sb.totalSeguidores, icon: <Users size={16} />, tooltip: 'seguidores' },
                            { label: 'Novos Seg.', value: sb.novosSeguidores, icon: <TrendingUp size={16} />, tooltip: 'novos_seguidores' },
                            { label: 'Alcance', value: sb.alcance, icon: <HeartHandshake size={16} />, tooltip: 'alcance' },
                            { label: 'Visualizacoes', value: sb.visualizacoes, icon: <Eye size={16} />, tooltip: 'visualizacoes' },
                            { label: 'Interacoes', value: sb.interacoes, icon: <Heart size={16} />, tooltip: 'interacoes' },
                            { label: 'Posts', value: sb.posts.length, icon: <MessageCircle size={16} /> },
                        ].map((card, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                                <div className="flex items-center gap-2 text-gray-500 mb-2">{card.icon}<span className="text-xs font-bold uppercase tracking-wider inline-flex items-center">{card.label}{card.tooltip && <MetricTooltip metric={card.tooltip} />}</span></div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {card.label === 'Alcance' && platform === 'twitter' ? <span className="text-gray-400">N/D</span> : fmtNum(card.value)}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Monthly Evolution Chart */}
                    {chartDataToUse.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <TrendingUp size={18} style={{ color: platformConfig?.accentColor || '#C0392B' }} /> {chartTitle}
                            </h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={chartDataToUse}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <YAxis tickFormatter={(v) => fmtNum(v)} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <Tooltip formatter={(value: number) => fmtNum(value)} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                                    <Legend />
                                    <Bar dataKey="Alcance" fill={platformConfig?.accentColor || '#E67E22'} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Interacoes" fill="#4b4b4b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Engagement breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
                            <Heart size={20} className="text-gray-800 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-gray-900">{fmtNum(sb.curtidasTotal)}</p>
                            <p className="text-xs text-gray-500 mt-1 inline-flex items-center">Curtidas<MetricTooltip metric="curtidas" /></p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
                            <MessageCircle size={20} className="text-gray-800 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-gray-900">{fmtNum(sb.comentariosTotal)}</p>
                            <p className="text-xs text-gray-500 mt-1 inline-flex items-center">Comentarios<MetricTooltip metric="comentarios" /></p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
                            <Share2 size={20} className="text-gray-800 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-gray-900">{fmtNum(sb.compartilhamentosTotal)}</p>
                            <p className="text-xs text-gray-500 mt-1 inline-flex items-center">{getSharesLabel()}<MetricTooltip metric="compartilhamentos" /></p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
                            <TrendingUp size={20} className="text-gray-800 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-gray-900">{sb.engajamentoTaxa.toFixed(2)}%</p>
                            <p className="text-xs text-gray-500 mt-1 inline-flex items-center">Taxa de Engajamento<MetricTooltip metric="engajamento" /></p>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'posts') {
            return (
                <div className="space-y-6 animate-fadeIn">
                    {/* Format chart from real data */}
                    {formatosData.length > 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-6">Distribuicao de Formatos ({sb.posts.length} posts)</h2>
                            <HorizontalBarChart data={formatosData} metricLabel="posts" />
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center text-gray-400">
                            Nenhum post encontrado no periodo para analise de formatos.
                        </div>
                    )}

                    {/* Top 5 posts table */}
                    {top5Posts.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">\uD83C\uDFC5 Top 5 Posts por {getMetricLabel()}</h3>
                                <span className="text-xs text-gray-500">Clique nas colunas para ordenar</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">#</th>
                                            <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Titulo / Formato</th>
                                            <ThSortable field="visualizacoes" label="Visualizacoes" tooltip="visualizacoes" />
                                            <ThSortable field="curtidas" label="Curtidas" tooltip="curtidas" />
                                            <ThSortable field="comentarios" label="Comentarios" tooltip="comentarios" />
                                            <ThSortable field="compartilhamentos" label={platform === 'twitter' ? 'Retweets' : 'Compartilh.'} tooltip="compartilhamentos" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {top5Posts.map((p, i) => (
                                            <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                <td className="px-6 py-3 font-bold text-gray-400">{i + 1}</td>
                                                <td className="px-6 py-3">
                                                    {p.permalink ? (
                                                        <a href={p.permalink} target="_blank" rel="noreferrer"
                                                            className="text-gray-800 hover:text-blue-600 font-medium line-clamp-1">
                                                            {p.titulo || getFallbackTitle(p.formato)}
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-800 font-medium line-clamp-1">
                                                            {p.titulo || getFallbackTitle(p.formato)}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-400 ml-1">({p.formato})</span>
                                                </td>
                                                <td className={`text-right px-6 py-3 ${sortField === 'visualizacoes' ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{fmtNum(p.visualizacoes)}</td>
                                                <td className={`text-right px-6 py-3 ${sortField === 'curtidas' ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{fmtNum(p.curtidas)}</td>
                                                <td className={`text-right px-6 py-3 ${sortField === 'comentarios' ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{fmtNum(p.comentarios)}</td>
                                                <td className={`text-right px-6 py-3 ${sortField === 'compartilhamentos' ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{fmtNum(p.compartilhamentos)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Worst 5 posts table */}
                    {worst5Posts.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">\uD83D\uDCC9 5 Posts com Menor Desempenho por {getMetricLabel()}</h3>
                                <span className="text-xs text-gray-500">Clique nas colunas para ordenar</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">#</th>
                                            <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Titulo / Formato</th>
                                            <ThSortable field="visualizacoes" label="Visualizacoes" tooltip="visualizacoes" />
                                            <ThSortable field="curtidas" label="Curtidas" tooltip="curtidas" />
                                            <ThSortable field="comentarios" label="Comentarios" tooltip="comentarios" />
                                            <ThSortable field="compartilhamentos" label={platform === 'twitter' ? 'Retweets' : 'Compartilh.'} tooltip="compartilhamentos" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {worst5Posts.map((p, i) => (
                                            <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                <td className="px-6 py-3 font-bold text-gray-400">{i + 1}</td>
                                                <td className="px-6 py-3">
                                                    {p.permalink ? (
                                                        <a href={p.permalink} target="_blank" rel="noreferrer"
                                                            className="text-gray-800 hover:text-blue-600 font-medium line-clamp-1">
                                                            {p.titulo || getFallbackTitle(p.formato)}
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-800 font-medium line-clamp-1">
                                                            {p.titulo || getFallbackTitle(p.formato)}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-400 ml-1">({p.formato})</span>
                                                </td>
                                                <td className={`text-right px-6 py-3 ${sortField === 'visualizacoes' ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{fmtNum(p.visualizacoes)}</td>
                                                <td className={`text-right px-6 py-3 ${sortField === 'curtidas' ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{fmtNum(p.curtidas)}</td>
                                                <td className={`text-right px-6 py-3 ${sortField === 'comentarios' ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{fmtNum(p.comentarios)}</td>
                                                <td className={`text-right px-6 py-3 ${sortField === 'compartilhamentos' ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{fmtNum(p.compartilhamentos)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (activeTab === 'melhor') {
            const topPosts = sb.melhoresPosts?.length ? sb.melhoresPosts : (sb.melhorPost ? [sb.melhorPost] : []);
            if (topPosts.length === 0) return <div className="text-gray-400 text-center py-12">Nenhum post encontrado no periodo.</div>;
            const currentPost = topPosts[melhorPostIndex] ?? topPosts[0];
            return (
                <div className="space-y-4">
                    <PostCard post={currentPost} label={`Melhor Post`} themeColor="bg-green-50" />
                    {topPosts.length > 1 && (
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => setMelhorPostIndex(i => Math.max(0, i - 1))}
                                disabled={melhorPostIndex === 0}
                                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                ← Anterior
                            </button>
                            <div className="flex items-center gap-2">
                                {topPosts.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setMelhorPostIndex(i)}
                                        className={`w-2.5 h-2.5 rounded-full transition-colors ${i === melhorPostIndex ? 'bg-green-500' : 'bg-gray-300 hover:bg-gray-400'}`}
                                        title={`Post ${i + 1}`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={() => setMelhorPostIndex(i => Math.min(topPosts.length - 1, i + 1))}
                                disabled={melhorPostIndex === topPosts.length - 1}
                                className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Próximo →
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        if (activeTab === 'pior') {
            if (!sb.piorPost) return <div className="text-gray-400 text-center py-12">Nenhum post encontrado no periodo.</div>;
            return <PostCard post={sb.piorPost} label="Baixo Desempenho" themeColor="bg-red-50" />;
        }

        return null;
    };

    const renderFixo = () => {
        if (sb.loading) return <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>;

        const contaGeral = sb.monthly.map(m => ({
            mes: `${m.mes}/${m.ano.slice(2)}`,
            alcance: platform === 'twitter' ? 'N/D' : fmtNum(m.alcance),
            visualizacoes: fmtNum(m.visualizacoes),
            interacoes: fmtNum(m.interacoes),
            engajamento: m.alcance > 0 ? ((m.interacoes / m.alcance) * 100).toFixed(2) + '%' : '0%',
            novosSeguidores: fmtNum(m.novosSeguidores),
            totalSeguidores: fmtNum(m.totalSeguidores),
        }));

        if (activeTab === 'conta') {
            const columns = [
                { key: 'mes', label: 'MES' },
                { key: 'alcance', label: 'ALCANCE', tooltip: 'alcance' },
                { key: 'visualizacoes', label: 'VISUALIZACOES', tooltip: 'visualizacoes' },
                { key: 'interacoes', label: 'INTERACOES', tooltip: 'interacoes' },
                { key: 'engajamento', label: 'ENGAJAMENTO (%)', tooltip: 'engajamento' },
                { key: 'novosSeguidores', label: 'NOVOS SEG.', tooltip: 'novos_seguidores' },
                { key: 'totalSeguidores', label: 'TOTAL SEG.', tooltip: 'seguidores' },
            ];

            // Mini chart - adapta ao periodo (diario ou mensal)
            const miniData = chartDataToUse.map(d => ({
                name: d.name,
                Alcance: d.Alcance,
            }));
            const miniTitle = isShortPeriod
                ? `Evolucao do Alcance (Diaria)`
                : `Evolucao do Alcance (Mensal)`;

            return (
                <div className="animate-fadeIn space-y-6">
                    {miniData.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h3 className="font-bold text-gray-800 mb-3">{miniTitle}</h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={miniData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                    <YAxis tickFormatter={(v) => fmtNum(v)} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                    <Tooltip formatter={(value: number) => fmtNum(value)} />
                                    <Line type="monotone" dataKey="Alcance" stroke={platformConfig?.accentColor || '#E67E22'} strokeWidth={2} dot={{ r: 4, fill: platformConfig?.accentColor || '#E67E22' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">Evolucao: Conta (Geral)</h2>
                        </div>
                        <DataTable columns={columns} data={contaGeral} />
                    </div>
                </div>
            );
        }

        // Dynamic tab handling based on platformConfig.fixoTabs
        const currentFixoTab = platformConfig?.fixoTabs?.find(t => t.id === activeTab);

        if (currentFixoTab && activeTab !== 'conta') {
            const isStoriesTab = activeTab === 'stories' && platformConfig?.hasStories;
            const selectedFormats = currentFixoTab.formats;

            let specificRows;
            if (isStoriesTab) {
                // For stories, group directly by month from posts (not from sb.monthly)
                const storyPosts = sb.posts.filter(p =>
                    selectedFormats.map(f => f.toUpperCase()).includes((p.formato || 'OUTROS').toUpperCase())
                );
                const MES_MAP: Record<string, string> = {
                    '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
                    '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
                    '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
                };
                const monthMap: Record<string, typeof storyPosts> = {};
                storyPosts.forEach(p => {
                    const key = (p.date || '').substring(0, 7);
                    if (key) {
                        if (!monthMap[key]) monthMap[key] = [];
                        monthMap[key].push(p);
                    }
                });
                specificRows = Object.entries(monthMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([key, posts]) => {
                        const [y, m] = key.split('-');
                        return {
                            mes: `${MES_MAP[m] || m}/${y.slice(2)}`,
                            quantidade: posts.length,
                            visualizacoes: fmtNum(posts.reduce((s, p) => s + (p.visualizacoes || 0), 0)),
                            interacoes: fmtNum(posts.reduce((s, p) =>
                                s + (p.curtidas || 0) + (p.comentarios || 0) +
                                (p.compartilhamentos || 0) + (p.salvamentos || 0), 0)),
                        };
                    });
            } else {
                // Generic format-based tab: filter posts matching the formats from config
                const formatsUpper = selectedFormats.map(f => f.toUpperCase());
                specificRows = sb.monthly.map(m => {
                    const monthPosts = sb.posts.filter(p => {
                        const postMonth = (p.date || '').substring(0, 7);
                        return postMonth === m.date && formatsUpper.includes((p.formato || 'OUTROS').toUpperCase());
                    });
                    const sumVisualizacoes = monthPosts.reduce((s, p) => s + (p.visualizacoes || 0), 0);
                    const sumInteracoes = monthPosts.reduce((s, p) => s + ((p.curtidas || 0) + (p.comentarios || 0) + (p.compartilhamentos || 0) + (p.salvamentos || 0)), 0);
                    return {
                        mes: `${m.mes}/${m.ano.slice(2)}`,
                        quantidade: monthPosts.length,
                        visualizacoes: fmtNum(sumVisualizacoes),
                        interacoes: fmtNum(sumInteracoes),
                    };
                });
            }

            const columns = [
                { key: 'mes', label: 'MES' },
                { key: 'quantidade', label: 'QUANTIDADE' },
                { key: 'visualizacoes', label: 'VISUALIZACOES', tooltip: 'visualizacoes' },
                { key: 'interacoes', label: 'INTERACOES', tooltip: 'interacoes' },
            ];

            return (
                <div className="animate-fadeIn">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">{currentFixoTab.label}</h2>
                        </div>
                        {isStoriesTab && specificRows.length === 0 ? (
                            <div className="px-6 py-8 text-center text-sm text-gray-400">
                                <p className="font-medium text-gray-500 mb-1">Nenhuma story encontrada no periodo.</p>
                                <p>Verifique no console do navegador se ha erros de permissao (RLS) na tabela de stories do Supabase.</p>
                            </div>
                        ) : (
                            <DataTable columns={columns} data={specificRows} />
                        )}
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            {/* Platform header */}
            <div className={`rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 bg-gradient-to-r ${styles.gradFrom} ${styles.gradTo} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl opacity-20 bg-white"></div>
                <div className="flex items-center relative z-10">
                    <div className="mr-5 w-12 h-12 bg-white" style={{
                        mask: `url(${platformConfig?.icon || '/instagram.svg'}) center/contain no-repeat`,
                        WebkitMask: `url(${platformConfig?.icon || '/instagram.svg'}) center/contain no-repeat`
                    }}>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">{styles.text}</h1>
                        <p className="text-sm font-medium text-white/70 uppercase tracking-widest mt-1">
                            Visualizacao {mode === 'flexivel' ? 'Flexivel (Customizavel)' : 'Fixa (Mensal)'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2 border-b border-gray-200">
                {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`whitespace-nowrap text-sm font-medium border-b-2 px-4 pb-3 pt-1 transition-colors
                          ${activeTab === tab.id
                                ? 'border-[#C0392B] text-gray-900'
                                : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[500px] pt-2">
                {mode === 'flexivel' ? renderFlexivel() : renderFixo()}
            </div>
        </div>
    );
};

export default SocialDashboard;
