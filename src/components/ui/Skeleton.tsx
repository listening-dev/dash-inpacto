import React from 'react';

export const SkeletonBlock: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} style={style} />
);

/** Skeleton que imita um card KPI (Instagram, Facebook…) */
export const SkeletonKpiCard: React.FC = () => (
    <div className="rounded-xl p-5 shadow-sm bg-white border border-gray-100">
        <div className="flex justify-between mb-3">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="w-5 h-5 rounded" />
        </div>
        <SkeletonBlock className="h-8 w-16 mb-2" />
        <SkeletonBlock className="h-3 w-28 mb-1" />
        <SkeletonBlock className="h-3 w-24" />
    </div>
);

/** Skeleton que imita um card de métrica pequeno (Curtidas, Comentários…) */
export const SkeletonMetricCard: React.FC = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <SkeletonBlock className="h-4 w-4 rounded mb-2" />
        <SkeletonBlock className="h-7 w-14 mb-1" />
        <SkeletonBlock className="h-3 w-20" />
    </div>
);

/** Skeleton de uma linha de tabela */
export const SkeletonTableRow: React.FC<{ cols?: number }> = ({ cols = 6 }) => (
    <tr className="border-b border-gray-50">
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="px-6 py-4">
                <SkeletonBlock
                    className="h-3 rounded"
                    style={{ width: i === 1 ? '55%' : '40%' } as React.CSSProperties}
                />
            </td>
        ))}
    </tr>
);

/** Skeleton de um bloco de gráfico */
export const SkeletonChart: React.FC<{ height?: number }> = ({ height = 280 }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <SkeletonBlock className="h-5 w-40 mb-4" />
        <SkeletonBlock className="w-full rounded-lg" style={{ height } as React.CSSProperties} />
    </div>
);

/** Skeleton do PostCard (Melhores Posts / Baixo Desempenho) */
export const SkeletonPostCard: React.FC = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <SkeletonBlock className="h-6 w-48" />
        </div>
        <div className="flex flex-col md:flex-row gap-6 p-6">
            <div className="w-full md:w-1/3">
                <SkeletonBlock className="w-full h-48 rounded-xl" />
                <SkeletonBlock className="h-3 w-full mt-3" />
                <SkeletonBlock className="h-3 w-3/4 mt-2" />
            </div>
            <div className="w-full md:w-2/3 grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-6 border border-gray-100">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-3">
                        <SkeletonBlock className="h-3 w-24 mb-2" />
                        <SkeletonBlock className="h-7 w-16" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);
