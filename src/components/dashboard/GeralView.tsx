import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MetricTooltip } from '../ui/MetricTooltip';
import { BarChart3, TrendingUp, MouseIcon, Stars, Users } from 'lucide-react';
import { differenceInDays, parseISO, format, addDays } from 'date-fns';
import type { PlatformMetrics } from '../../lib/metrics';
import { PLATFORMS } from '../../config/platforms';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fmtNum, fmtCard } from '../../utils/formatters';
import { SkeletonKpiCard, SkeletonChart, SkeletonBlock } from '../ui/Skeleton';

interface GeralViewProps {
  all: Omit<PlatformMetrics, 'loading' | 'error'>;
  byPlatform: Record<string, Omit<PlatformMetrics, 'loading' | 'error'>>;
  loading: boolean;
  startDate: string;
  endDate: string;
}

const formatDisplayDate = (d: string) => {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

const GeralView: React.FC<GeralViewProps> = ({ all, byPlatform, loading, startDate, endDate }) => {
  const [evolutionTab, setEvolutionTab] = useState<'reach' | 'interactions'>('reach');
  const [animatedAlcance, setAnimatedAlcance] = useState(0);
  const alcanceRef = useRef(0);
  const prefersReducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const sbIG = byPlatform['instagram'];
  const sbFB = byPlatform['facebook'];
  const sbLI = byPlatform['linkedin'];
  const sbTW = byPlatform['twitter'];
  const platformDataMap: Record<string, Omit<PlatformMetrics, 'loading' | 'error'>> = {
    instagram: sbIG, facebook: sbFB, linkedin: sbLI, twitter: sbTW,
  };

  useEffect(() => {
    const target = (sbFB?.alcance ?? 0) + (sbIG?.alcance ?? 0) + (sbLI?.alcance ?? 0) + (sbTW?.alcance ?? 0);
    if (target === 0) return;

    if (prefersReducedMotion.current) {
      setAnimatedAlcance(target);
      alcanceRef.current = target;
      return;
    }

    const duration = 1800;
    const start = alcanceRef.current;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      const current = Math.round(start + (target - start) * eased);
      setAnimatedAlcance(current);
      if (elapsed < 1) requestAnimationFrame(tick);
      else alcanceRef.current = target;
    };
    requestAnimationFrame(tick);
  }, [sbFB?.alcance, sbIG?.alcance, sbLI?.alcance, sbTW?.alcance]);

  const isShortPeriod = useMemo(() => {
    try {
      return differenceInDays(parseISO(endDate), parseISO(startDate)) <= 30;
    } catch {
      return false;
    }
  }, [startDate, endDate]);

  const monthlyChartData = useMemo(() => {
    return all.monthly.map(m => ({
      name: `${m.mes}/${m.ano.slice(2)}`,
      Alcance: m.alcance,
      Visualizações: m.visualizacoes,
      Interações: m.interacoes,
    }));
  }, [all.monthly]);

  const dailyChartData = useMemo(() => {
    const dateMap: Record<string, { Alcance: number; Visualizações: number; Interações: number }> = {};
    all.daily.forEach(d => {
      if (!dateMap[d.date]) dateMap[d.date] = { Alcance: 0, Visualizações: 0, Interações: 0 };
      dateMap[d.date].Alcance += d.alcance || 0;
      dateMap[d.date].Visualizações += d.visualizacoes || 0;
      dateMap[d.date].Interações += d.interacoes || 0;
    });
    const result: { name: string; Alcance: number; Visualizações: number; Interações: number }[] = [];
    let current = parseISO(startDate);
    const end = parseISO(endDate);
    while (current <= end) {
      const key = format(current, 'yyyy-MM-dd');
      result.push({ name: formatDisplayDate(key), ...(dateMap[key] ?? { Alcance: 0, Visualizações: 0, Interações: 0 }) });
      current = addDays(current, 1);
    }
    return result;
  }, [all.daily, startDate, endDate]);

  const chartDataToUse = isShortPeriod ? dailyChartData : monthlyChartData;
  const rangeDays = differenceInDays(parseISO(endDate), parseISO(startDate));
  const chartTitle = isShortPeriod ? `Evolução Diária (${rangeDays} dias)` : `Evolução Mensal (${chartDataToUse.length} meses)`;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header institucional */}
      <div className="bg-gradient-to-r from-[#C0392B] to-[#E67E22] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <img src="/logo-inpacto.png" alt="In.Pacto Logo" className="h-[5.5rem] object-contain" />
          <div className="border-l border-white/20 pl-6 hidden md:block h-12"></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Painel de Performance Digital</h1>
            <p className="text-gray-200 text-1x1 mt-1">(Redes Sociais)</p>
            <div className="w-12 h-1 bg-orange-400 rounded-full mt-3"></div>
            <p className="text-xs text-gray-200 mt-3">
              Período: <strong className="text-white">{formatDisplayDate(startDate)}</strong> até <strong className="text-white">{formatDisplayDate(endDate)}</strong>
              {loading && <span className="ml-2 text-yellow-300 animate-pulse">Carregando…</span>}
            </p>
          </div>
        </div>

        {/* Impact stat pill */}
        <div className="relative z-10 mt-5 md:mt-0 flex-shrink-0 flex-1 md:max-w-[360px]">
          <div className="bg-white rounded-2xl px-10 py-5 text-center w-full shadow-[0_8px_32px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-1.5 justify-center mb-2">
              <Users size={13} className="text-[#C0392B]" />
              <span className="text-sm text-[#C0392B] uppercase tracking-widest font-bold">Alcance Total</span>
            </div>
            {loading ? (
              <div className="h-12 w-24 bg-gray-200 rounded animate-pulse mx-auto my-1" />
            ) : (
              <div className="text-5xl font-black text-[#C0392B] tracking-tight leading-none">
                {fmtCard(animatedAlcance)}
              </div>
            )}
            <div className="w-10 h-0.5 bg-[#E67E22] rounded-full mx-auto my-2.5"></div>
            <p className="text-lg text-gray-600 font-bold">Pessoas impactadas no período</p>
          </div>
        </div>
      </div>

      {/* 5 KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonKpiCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* Instagram */}
          <div className="rounded-xl p-5 shadow-sm relative bg-white border border-gray-100">
            <div className="absolute top-5 right-5">
              <img src="/instagram.svg" alt="Instagram" className="w-5 h-5 brightness-0" />
            </div>
            <div className="mb-3">
              <span className="text-xs font-bold text-black uppercase tracking-wider">Instagram</span>
            </div>
            <div className="text-3xl font-bold text-black">{fmtNum(sbIG?.alcance ?? 0)}</div>
            <p className="text-xs mt-1 inline-flex items-center text-gray-600">Alcance Total<MetricTooltip metric="alcance" /></p>
            <p className="text-xs mt-1 inline-flex items-center text-gray-600">+{fmtNum(sbIG?.novosSeguidores ?? 0)} seguidores<MetricTooltip metric="novos_seguidores" /></p>
          </div>

          {/* Facebook */}
          <div className="rounded-xl p-5 shadow-sm relative bg-white border border-gray-100">
            <div className="absolute top-5 right-5">
              <img src="/facebook.svg" alt="Facebook" className="w-5 h-5 brightness-0" />
            </div>
            <div className="mb-3">
              <span className="text-xs font-bold text-black uppercase tracking-wider">Facebook</span>
            </div>
            <div className="text-3xl font-bold text-black">{fmtNum(sbFB?.alcance ?? 0)}</div>
            <p className="text-xs mt-1 inline-flex items-center text-gray-600">Alcance Total<MetricTooltip metric="alcance" /></p>
            <p className="text-xs mt-1 inline-flex items-center text-gray-600">+{fmtNum(sbFB?.interacoes ?? 0)} interações<MetricTooltip metric="interacoes" /></p>
          </div>

          {/* LinkedIn */}
          <div className="rounded-xl p-5 shadow-sm relative bg-white border border-gray-100">
            <div className="absolute top-5 right-5">
              <img src="/linkedin.svg" alt="LinkedIn" className="w-5 h-5 brightness-0" />
            </div>
            <div className="mb-3">
              <span className="text-xs font-bold text-black uppercase tracking-wider">LinkedIn</span>
            </div>
            <div className="text-3xl font-bold text-black">{fmtNum(sbLI?.alcance ?? 0)}</div>
            <p className="text-xs mt-1 inline-flex items-center text-gray-600">Alcance Total<MetricTooltip metric="alcance" /></p>
            <p className="text-xs mt-1 inline-flex items-center text-gray-600">+{fmtNum(sbLI?.interacoes ?? 0)} interações<MetricTooltip metric="interacoes" /></p>
          </div>

          {/* X / Twitter */}
          <div className="rounded-xl p-5 shadow-sm relative bg-white border border-gray-100">
            <div className="absolute top-5 right-5">
              <img src="/x-twitter.svg" alt="X (Twitter)" className="w-5 h-5 brightness-0" />
            </div>
            <div className="mb-3">
              <span className="text-xs font-bold text-black uppercase tracking-wider">X (Twitter)</span>
            </div>
            <div className="text-3xl font-bold text-gray-400">N/D</div>
            <p className="text-xs mt-1 inline-flex items-center text-gray-600">Alcance Total<MetricTooltip metric="alcance_twitter" /></p>
            <p className="text-xs mt-1 inline-flex items-center text-gray-600 block">+{fmtNum(sbTW?.interacoes ?? 0)} interações<MetricTooltip metric="interacoes" /></p>
          </div>

          {/* Engajamento */}
          <div className="rounded-xl p-5 shadow-sm relative bg-white border border-gray-100">
            <div className="absolute top-5 right-5">
              <BarChart3 size={20} className="text-black" />
            </div>
            <div className="mb-3">
              <span className="text-xs font-bold text-black uppercase tracking-wider">Engajamento</span>
            </div>
            <div className="text-3xl font-bold text-black">{fmtNum(all.interacoes)}</div>
            <p className="text-xs mt-1 inline-flex items-center text-gray-600">Total Consolidado<MetricTooltip metric="interacoes_consolidado" /></p>
            <p className="text-xs mt-1 text-gray-600">Todas as redes</p>
          </div>
        </div>
      )}

      {/* Análise de Desempenho por Plataforma */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 size={18} className="text-gray-800" />
            Análise de Desempenho por Plataforma
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Plataforma</th>
                <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider"><span className="inline-flex items-center gap-0">Alcance<MetricTooltip metric="alcance" /></span></th>
                <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider"><span className="inline-flex items-center gap-0">Visualizações<MetricTooltip metric="visualizacoes" /></span></th>
                <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider"><span className="inline-flex items-center gap-0">Interações<MetricTooltip metric="interacoes" /></span></th>
                <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider"><span className="inline-flex items-center gap-0">Taxa Engaj.<MetricTooltip metric="engajamento" /></span></th>
                <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider"><span className="inline-flex items-center gap-0">Seguidores<MetricTooltip metric="seguidores" /></span></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <SkeletonBlock className="h-3 rounded" style={{ width: j === 0 ? '60%' : '40%' } as React.CSSProperties} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : PLATFORMS.map(p => {
                const data = platformDataMap[p.id];
                if (!data) return null;
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.accentColor }}></span>
                        {p.label}
                      </div>
                    </td>
                    <td className="text-right px-6 py-4 text-gray-700 font-semibold">
                      {p.id === 'twitter' ? (
                        <span className="inline-flex items-center justify-end gap-1">
                          <span className="text-gray-400">—</span>
                          <MetricTooltip metric="alcance_twitter" />
                        </span>
                      ) : fmtNum(data.alcance)}
                    </td>
                    <td className="text-right px-6 py-4 text-gray-700">{fmtNum(data.visualizacoes)}</td>
                    <td className="text-right px-6 py-4 text-gray-700">{fmtNum(data.interacoes)}</td>
                    <td className="text-right px-6 py-4">
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-bold">
                        {data.engajamentoTaxa.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right px-6 py-4 text-gray-700 font-semibold">{fmtNum(data.totalSeguidores)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evolução + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {loading ? (
          <>
            <div className="lg:col-span-2"><SkeletonChart height={300} /></div>
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <SkeletonBlock className="h-4 w-24 mb-4" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-gray-50">
                    <SkeletonBlock className="h-3 w-28" />
                    <SkeletonBlock className="h-3 w-10" />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-gray-800" />
                {chartTitle}
              </h3>

              <div className="flex bg-gray-50/80 p-1 rounded-xl w-fit mb-6 border border-gray-100">
                <button
                  onClick={() => setEvolutionTab('reach')}
                  className={`px-4 py-2 text-[11px] font-bold rounded-lg transition-all ${
                    evolutionTab === 'reach'
                      ? 'bg-white text-[#C0392B] shadow-sm border border-gray-100'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Alcance x Visualizações
                </button>
                <button
                  onClick={() => setEvolutionTab('interactions')}
                  className={`px-4 py-2 text-[11px] font-bold rounded-lg transition-all ${
                    evolutionTab === 'interactions'
                      ? 'bg-white text-[#C0392B] shadow-sm border border-gray-100'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Apenas Interações
                </button>
              </div>

              {chartDataToUse.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartDataToUse} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} padding={{ left: 15, right: 15 }} />
                    <YAxis yAxisId="left" scale="sqrt" tickFormatter={(v) => fmtNum(v)} tick={{ fontSize: 12, fill: '#6b7280' }} width={65} />
                    <Tooltip formatter={(value: number) => fmtNum(value)} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                    <Legend />
                    {evolutionTab === 'reach' && (
                      <Line yAxisId="left" type="monotone" dataKey="Alcance" stroke="#E67E22" strokeWidth={2} dot={{ r: 4 }} />
                    )}
                    {evolutionTab === 'reach' && (
                      <Line yAxisId="left" type="monotone" dataKey="Visualizações" stroke="#C0392B" strokeWidth={2} dot={{ r: 4 }} />
                    )}
                    {evolutionTab === 'interactions' && (
                      <Line yAxisId="left" type="monotone" dataKey="Interações" stroke="#4b4b4b" strokeWidth={2} dot={{ r: 4 }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-center gap-2 text-gray-400 text-sm">
                  <div className="text-3xl">📊</div>
                  <p>Sem dados para o período selecionado</p>
                  <p className="text-xs">Tente ampliar o intervalo de datas.</p>
                </div>
              )}
            </div>

            {/* Insights */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Stars size={16} className="text-gray-800" />
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Destaques</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-600">Total de Posts</span>
                    <span className="font-bold text-gray-900">{all.posts.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-600 inline-flex items-center">Novos Seguidores<MetricTooltip metric="novos_seguidores_consolidado" /></span>
                    <span className="font-bold text-green-700">+{fmtNum(all.novosSeguidores)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-600 inline-flex items-center">Taxa Engajamento<MetricTooltip metric="engajamento_consolidado" /></span>
                    <span className="font-bold text-green-700">{all.engajamentoTaxa.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-600">Melhor Dia</span>
                    <span className="font-bold text-gray-900">{all.bestDay}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Horário de Pico</span>
                    <span className="font-bold text-gray-900">{all.peakTime}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MouseIcon size={16} className="text-gray-800" />
                  Interações por Rede
                </h4>
                <div className="space-y-2">
                  {PLATFORMS.map(p => {
                    const data = platformDataMap[p.id];
                    if (!data) return null;
                    const maxVal = Math.max(
                      sbIG?.interacoes ?? 0,
                      sbFB?.interacoes ?? 0,
                      sbLI?.interacoes ?? 0,
                      sbTW?.interacoes ?? 0,
                      1,
                    );
                    return (
                      <div key={p.id}>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{p.label}</span>
                          <span className="font-bold">{fmtNum(data.interacoes)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${(data.interacoes / maxVal) * 100}%`, backgroundColor: p.accentColor }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GeralView;
