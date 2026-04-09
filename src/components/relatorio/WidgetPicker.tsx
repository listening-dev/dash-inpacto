import React, { useState } from 'react';
import { X, BarChart2, TrendingUp, PieChart, Star, LayoutGrid, AlertTriangle } from 'lucide-react';
import { WidgetKey } from '../../types/relatorio';
import { WIDGET_REGISTRY, PLATFORM_LABELS } from './widgetRegistry';

const WIDGET_ICONS: Record<WidgetKey, React.ReactNode> = {
  'kpi.metricas': <BarChart2 size={20} />,
  'chart.evolucao': <TrendingUp size={20} />,
  'chart.formato': <PieChart size={20} />,
  'tabela.top_posts': <Star size={20} />,
  'tabela.plataformas': <LayoutGrid size={20} />,
  'tabela.baixo_desempenho': <AlertTriangle size={20} />,
};

const ALL_PLATFORMS = ['all', 'instagram', 'facebook', 'linkedin', 'twitter'] as const;

interface Props {
  periodoInicio: string;
  periodoFim: string;
  onAdd: (widgetKey: WidgetKey, config: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}

export default function WidgetPicker({ periodoInicio, periodoFim, onAdd, onClose }: Props) {
  const [selected, setSelected] = useState<WidgetKey | null>(null);
  const [platform, setPlatform] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const selectedDef = WIDGET_REGISTRY.find(w => w.key === selected);
  const availablePlatforms = selectedDef
    ? ALL_PLATFORMS.filter(p => selectedDef.platforms.includes(p as any))
    : ALL_PLATFORMS;

  const handleAdd = async () => {
    if (!selected) return;
    setLoading(true);
    await onAdd(selected, { platform });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Adicionar Widget</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>

        {periodoInicio && periodoFim && (
          <p className="text-xs text-gray-500 -mt-2">
            Dados do período: <strong>{periodoInicio}</strong> a <strong>{periodoFim}</strong>
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {WIDGET_REGISTRY.map(widget => (
            <button
              key={widget.key}
              onClick={() => {
                setSelected(widget.key);
                if (!widget.platforms.includes(platform as any)) {
                  setPlatform(widget.platforms[0] || 'all');
                }
              }}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                selected === widget.key
                  ? 'border-[#C0392B] bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`mt-0.5 flex-shrink-0 ${selected === widget.key ? 'text-[#C0392B]' : 'text-gray-400'}`}>
                {WIDGET_ICONS[widget.key]}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{widget.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{widget.description}</p>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Plataforma</label>
            <div className="flex flex-wrap gap-2">
              {availablePlatforms.map(p => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    platform === p
                      ? 'bg-[#C0392B] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {PLATFORM_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            disabled={!selected || loading}
            className="px-5 py-2 bg-[#C0392B] hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-40 flex items-center gap-2"
          >
            {loading ? 'Capturando dados...' : 'Adicionar Widget'}
          </button>
        </div>
      </div>
    </div>
  );
}
