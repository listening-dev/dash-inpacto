import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Columns, Square, Pencil, Trash2 } from 'lucide-react';
import { RelatorioItem, WidgetKey, TextTipo } from '../../types/relatorio';
import { getWidgetDef, PLATFORM_LABELS } from './widgetRegistry';
import { useCanvasActions } from './CanvasActionsContext';
import TextBlockRenderer from './TextBlockRenderer';
import TextBlockEditor from './TextBlockEditor';

interface Props {
  item: RelatorioItem;
  isFirst: boolean;
  isLast: boolean;
}

function renderWidgetContent(item: RelatorioItem) {
  const snap = item.widget_snapshot;
  if (!snap) return <div className="text-center text-gray-400 py-8 text-sm">Sem dados capturados</div>;

  const def = getWidgetDef(item.widget_key as WidgetKey);
  if (!def) return <div className="text-gray-400 text-sm">Widget desconhecido</div>;

  return def.render(snap);
}

export default function CanvasItem({ item, isFirst, isLast }: Props) {
  const [editingText, setEditingText] = useState(false);
  const { onMoveUp, onMoveDown, onDelete, onToggleColuna, onUpdateText } = useCanvasActions();

  const isWidget = item.tipo === 'widget';
  const widgetDef = isWidget ? getWidgetDef(item.widget_key as WidgetKey) : null;
  const platform = (item.widget_config as Record<string, string> | undefined)?.platform;

  const title = item.widget_titulo
    || widgetDef?.label
    || (item.tipo === 'text_block' ? '' : 'Widget');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" data-canvas-item="true">
      {/* Control bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100" data-html2canvas-ignore="true">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-gray-800 truncate">{title}</span>
          {platform && (
            <span className="text-xs text-gray-400 flex-shrink-0">
              · {PLATFORM_LABELS[platform] || platform}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0" data-html2canvas-ignore="true">
          <button
            onClick={() => onToggleColuna(item.id, item.coluna)}
            title={item.coluna === 0 ? 'Dividir em meia coluna' : 'Tornar largura total'}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {item.coluna === 0 ? <Columns size={14} /> : <Square size={14} />}
          </button>
          <button
            onClick={() => onMoveUp(item.id)}
            disabled={isFirst}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-30"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => onMoveDown(item.id)}
            disabled={isLast}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-30"
          >
            <ChevronDown size={14} />
          </button>
          {!isWidget && (
            <button
              onClick={() => setEditingText(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Pencil size={14} />
            </button>
          )}
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isWidget
          ? renderWidgetContent(item)
          : <TextBlockRenderer tipo={item.text_tipo as TextTipo} content={item.text_content} />
        }
      </div>

      {/* Text editor modal */}
      {editingText && (
        <TextBlockEditor
          initialTipo={(item.text_tipo as TextTipo) || 'livre'}
          initialContent={item.text_content || ''}
          onSave={(_tipo, content) => { onUpdateText(item.id, content); setEditingText(false); }}
          onClose={() => setEditingText(false)}
        />
      )}
    </div>
  );
}
