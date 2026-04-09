import React, { useState } from 'react';
import { Plus, Trash2, ChevronRight, FileText, Loader2, X } from 'lucide-react';
import { Relatorio } from '../../types/relatorio';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  relatorios: Relatorio[];
  loading: boolean;
  onOpen: (r: Relatorio) => void;
  onCreate: (titulo: string, inicio: string, fim: string) => Promise<void>;
  onDelete: (id: string) => void;
}

function formatDate(d?: string) {
  if (!d) return '—';
  try { return format(parseISO(d), 'dd/MM/yyyy', { locale: ptBR }); } catch { return d; }
}

export default function RelatorioList({ relatorios, loading, onOpen, onCreate, onDelete }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!titulo.trim()) return;
    setCreating(true);
    await onCreate(titulo.trim(), inicio, fim);
    setTitulo('');
    setInicio('');
    setFim('');
    setShowCreate(false);
    setCreating(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
          <p className="text-sm text-gray-500 mt-1">Crie, edite e exporte seus relatórios de desempenho.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#C0392B] hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors"
        >
          <Plus size={16} /> Novo Relatório
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 size={24} className="animate-spin mr-2" /> Carregando...
        </div>
      ) : relatorios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <FileText size={28} />
          </div>
          <p className="font-semibold text-gray-500">Nenhum relatório criado ainda</p>
          <p className="text-sm mt-1">Clique em "Novo Relatório" para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatorios.map(r => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => onOpen(r)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 truncate group-hover:text-[#C0392B] transition-colors">
                    {r.titulo}
                  </h3>
                  {r.descricao && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.descricao}</p>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setDeleteConfirm(r.id); }}
                  className="flex-shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex flex-col gap-1 text-xs text-gray-500">
                {(r.periodo_inicio || r.periodo_fim) && (
                  <span>Período: {formatDate(r.periodo_inicio)} a {formatDate(r.periodo_fim)}</span>
                )}
                <span>Criado em {formatDate(r.created_at)}</span>
              </div>

              <div className="flex items-center justify-end text-xs font-semibold text-[#C0392B] gap-1">
                Abrir <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowCreate(false)}>
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Novo Relatório</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Título *</label>
              <input
                autoFocus
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Ex: Relatório Janeiro 2026"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C0392B] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Período início</label>
                <input
                  type="date"
                  value={inicio}
                  onChange={e => setInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C0392B] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Período fim</label>
                <input
                  type="date"
                  value={fim}
                  onChange={e => setFim(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C0392B] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!titulo.trim() || creating}
                className="px-5 py-2 bg-[#C0392B] hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-40 flex items-center gap-2"
              >
                {creating && <Loader2 size={14} className="animate-spin" />}
                Criar Relatório
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDeleteConfirm(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900">Excluir relatório?</h3>
            <p className="text-sm text-gray-500">Esta ação não pode ser desfeita. Todos os widgets e textos serão removidos.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
                Cancelar
              </button>
              <button
                onClick={() => { onDelete(deleteConfirm); setDeleteConfirm(null); }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
