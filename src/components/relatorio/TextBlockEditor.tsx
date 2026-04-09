import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TextTipo } from '../../types/relatorio';

const TEXT_TIPOS: { value: TextTipo; label: string }[] = [
  { value: 'analise', label: 'Análise Crítica' },
  { value: 'proximos_passos', label: 'Próximos Passos' },
  { value: 'planos_acao', label: 'Planos de Ação' },
  { value: 'livre', label: 'Texto Livre' },
];

interface Props {
  initialTipo?: TextTipo;
  initialContent?: string;
  onSave: (tipo: TextTipo, content: string) => void;
  onClose: () => void;
}

export default function TextBlockEditor({ initialTipo = 'livre', initialContent = '', onSave, onClose }: Props) {
  const [tipo, setTipo] = useState<TextTipo>(initialTipo);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setTipo(initialTipo);
    setContent(initialContent);
  }, [initialTipo, initialContent]);

  const handleSave = () => {
    if (!content.trim()) return;
    onSave(tipo, content.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Bloco de Texto</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1.5">Tipo</label>
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value as TextTipo)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C0392B] focus:outline-none"
          >
            {TEXT_TIPOS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 block mb-1.5">Conteúdo</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={8}
            maxLength={10000}
            placeholder="Escreva aqui..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C0392B] focus:outline-none resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{content.length}/10000</p>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className="px-5 py-2 bg-[#C0392B] hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-40"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
