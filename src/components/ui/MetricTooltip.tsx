import React, { useState, useRef } from 'react';

export const METRIC_GLOSSARY: Record<string, string> = {
    // Por plataforma / por publicacao
    alcance: 'Número de contas únicas que viram seu conteúdo pelo menos uma vez no período.',
    visualizacoes: 'Total de exibições do conteúdo, incluindo múltiplas visualizações do mesmo usuário.',
    interacoes: 'Soma de todas as ações no conteúdo: curtidas, comentários, compartilhamentos e salvamentos.',
    engajamento: 'Percentual de pessoas que interagiram em relação ao alcance. Fórmula: (Interações ÷ Alcance) × 100.',
    seguidores: 'Total de seguidores da conta ao final do período selecionado.',
    novos_seguidores: 'Quantidade de novos seguidores conquistados no período selecionado.',
    curtidas: 'Número de curtidas ou reações positivas no conteúdo.',
    comentarios: 'Número de comentários publicados no conteúdo.',
    compartilhamentos: 'Número de vezes que o conteúdo foi compartilhado por outros usuários.',
    salvamentos: 'Número de vezes que o post foi salvo para ver depois (exclusivo do Instagram).',
    reacoes: 'Reações ao conteúdo no Facebook: Curtir, Amar, Uau, Haha, Triste, Grr.',
    impressoes: 'Número de vezes que o conteúdo foi exibido para os usuários.',

    // LinkedIn
    cliques: 'Número de cliques em links no conteúdo do LinkedIn.',
    impressoes_unicas: 'Número de contas únicas que viram seu conteúdo no LinkedIn.',

    // X/Twitter
    retweets: 'Número de vezes que o tweet foi retuitado por outros usuários.',
    favoritos: 'Número de vezes que o tweet foi favoritado (curtido) no X.',
    alcance_twitter: 'O X (Twitter) não fornece dados de Alcance. A plataforma disponibiliza apenas Visualizações (impressões).',

    // Dados consolidados (todas as redes)
    alcance_consolidado: 'Alcance somado de todas as redes sociais no período. O X/Twitter não reporta alcance.',
    visualizacoes_consolidado: 'Visualizações somadas de todas as redes sociais no período.',
    interacoes_consolidado: 'Soma de todas as interações de todas as redes sociais no período.',
    seguidores_consolidado: 'Total de seguidores somados de todas as redes sociais gerenciadas.',
    novos_seguidores_consolidado: 'Novos seguidores somados de todas as redes sociais no período.',
    engajamento_consolidado: 'Taxa de engajamento consolidada: total de interações de todas as redes dividido pelo alcance total.',
};

interface MetricTooltipProps {
    metric: string;
}

export const MetricTooltip: React.FC<MetricTooltipProps> = ({ metric }) => {
    const text = METRIC_GLOSSARY[metric];
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef<HTMLSpanElement>(null);

    if (!text) return null;

    const computePos = () => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setPos({
                top: rect.top,
                left: rect.left + rect.width / 2,
            });
        }
    };

    const handleMouseEnter = () => {
        computePos();
        setVisible(true);
    };

    const handleTouchOrClick = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        if (!visible) {
            computePos();
            setVisible(true);
        } else {
            setVisible(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!visible) {
                computePos();
                setVisible(true);
            } else {
                setVisible(false);
            }
        }
        if (e.key === 'Escape') setVisible(false);
    };

    return (
        <span className="relative inline-flex items-center ml-1">
            <span
                ref={btnRef}
                role="button"
                tabIndex={0}
                aria-label={`Ver definição de ${metric}`}
                aria-expanded={visible}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setVisible(false)}
                onClick={handleTouchOrClick}
                onKeyDown={handleKeyDown}
                className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-300 text-gray-400 text-[9px] font-bold leading-none select-none cursor-pointer hover:border-gray-500 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C0392B]/40"
            >
                ?
            </span>
            {visible && (
                <div
                    style={{
                        position: 'fixed',
                        top: pos.top - 8,
                        left: pos.left,
                        transform: 'translate(-50%, -100%)',
                        zIndex: 9999,
                        pointerEvents: 'none',
                    }}
                    role="tooltip"
                    className="w-56 bg-gray-800 text-white text-[11px] leading-relaxed rounded-lg px-3 py-2 shadow-xl normal-case font-normal tracking-normal text-left whitespace-normal"
                >
                    {text}
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></span>
                </div>
            )}
        </span>
    );
};

export default MetricTooltip;
