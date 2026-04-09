import React, { useState, useRef } from 'react';
import { ArrowLeft, Plus, Type, FileDown, Loader2, Check, Pencil } from 'lucide-react';
import { Relatorio, WidgetKey, TextTipo } from '../../types/relatorio';
import { useRelatorioItens } from '../../hooks/useRelatorioItens';
import { useRelatorios } from '../../hooks/useRelatorios';
import CanvasArea from './CanvasArea';
import { CanvasActionsProvider } from './CanvasActionsContext';
import WidgetPicker from './WidgetPicker';
import TextBlockEditor from './TextBlockEditor';

interface Props {
  relatorio: Relatorio;
  userId: string;
  onBack: () => void;
  onUpdated: (r: Relatorio) => void;
}

export default function RelatorioBuilder({ relatorio, userId, onBack, onUpdated }: Props) {
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingPptx, setExportingPptx] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(relatorio.titulo);
  const canvasRef = useRef<HTMLDivElement>(null);

  const { updateRelatorio } = useRelatorios(userId);
  const { itens, loading, error, addWidgetItem, addTextItem, updateTextItem, deleteItem, reorderItem, updateColuna } = useRelatorioItens(relatorio.id);

  const periodoInicio = relatorio.periodo_inicio || '';
  const periodoFim = relatorio.periodo_fim || '';

  const handleAddWidget = async (widgetKey: WidgetKey, config: Record<string, unknown>) => {
    await addWidgetItem(widgetKey, config, periodoInicio, periodoFim);
  };

  const handleAddText = async (tipo: TextTipo, content: string) => {
    await addTextItem(tipo, content);
  };

  const handleSaveTitle = async () => {
    if (!titleValue.trim()) return;
    await updateRelatorio(relatorio.id, { titulo: titleValue.trim() });
    onUpdated({ ...relatorio, titulo: titleValue.trim() });
    setEditingTitle(false);
  };

  const handleExportPdf = async () => {
    if (!canvasRef.current) return;
    setExportingPdf(true);
    try {
      const [html2canvas, jsPDF] = await Promise.all([
        import('html2canvas').then(m => m.default),
        import('jspdf').then(m => m.jsPDF),
      ]);

      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f5f5f0',
        logging: false,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      // Add title page info
      pdf.setFontSize(16);
      pdf.setTextColor(40, 40, 40);
      pdf.text(relatorio.titulo, 15, 20);

      if (periodoInicio && periodoFim) {
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Período: ${periodoInicio} a ${periodoFim}`, 15, 28);
      }

      pdf.setFontSize(9);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 15, 34);

      // Add content image, split across pages
      const headerHeight = 40;
      let yOffset = 0;
      let isFirstPage = true;

      while (yOffset < scaledHeight) {
        if (!isFirstPage) pdf.addPage();
        const yStart = isFirstPage ? headerHeight : 0;
        const pageAvailable = isFirstPage ? (pdfHeight - headerHeight) : pdfHeight;
        const sliceHeightPx = pageAvailable / ratio;
        const srcY = yOffset / ratio;
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = imgWidth;
        sliceCanvas.height = Math.min(sliceHeightPx, imgHeight - srcY);
        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, srcY, imgWidth, sliceCanvas.height, 0, 0, imgWidth, sliceCanvas.height);
          const sliceData = sliceCanvas.toDataURL('image/png');
          const sliceDisplayHeight = sliceCanvas.height * ratio;
          pdf.addImage(sliceData, 'PNG', 0, yStart, pdfWidth, sliceDisplayHeight);
        }
        yOffset += pageAvailable;
        isFirstPage = false;
      }

      pdf.save(`${relatorio.titulo.replace(/[^a-zA-Z0-9À-ú\s]/g, '')}.pdf`);
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportPptx = async () => {
    if (!canvasRef.current) return;
    setExportingPptx(true);
    try {
      const [html2canvas, pptxgen] = await Promise.all([
        import('html2canvas').then(m => m.default),
        import('pptxgenjs').then(m => m.default),
      ]);

      const pptx = new pptxgen();
      pptx.layout = 'LAYOUT_WIDE'; // 13.33" x 7.5"
      const slideW = 13.33;
      const slideH = 7.5;
      const margin = 0.3;

      // Slide de capa com texto editável
      const titleSlide = pptx.addSlide();
      titleSlide.background = { color: 'F5F5F0' };
      titleSlide.addText(relatorio.titulo, { x: 1, y: 2.8, w: 11, h: 1.2, fontSize: 36, bold: true, color: '282828' });
      if (periodoInicio && periodoFim) {
        titleSlide.addText(`Período: ${periodoInicio} a ${periodoFim}`, { x: 1, y: 4.2, w: 11, h: 0.6, fontSize: 18, color: '646464' });
      }
      titleSlide.addText(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, { x: 1, y: 4.9, w: 11, h: 0.5, fontSize: 14, color: '969696' });

      // Um slide por widget — captura cada CanvasItem individualmente
      const itemEls = Array.from(
        canvasRef.current.querySelectorAll<HTMLElement>('[data-canvas-item]')
      );

      for (const el of itemEls) {
        const itemCanvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        });

        const imgW = itemCanvas.width;
        const imgH = itemCanvas.height;

        // Escala para caber no slide com margem
        const maxW = slideW - 2 * margin;
        const maxH = slideH - 2 * margin;
        let displayW = maxW;
        let displayH = imgH * (displayW / imgW);
        if (displayH > maxH) {
          displayH = maxH;
          displayW = imgW * (displayH / imgH);
        }

        const x = (slideW - displayW) / 2;
        const y = (slideH - displayH) / 2;

        const contentSlide = pptx.addSlide();
        contentSlide.background = { color: 'F5F5F0' };
        contentSlide.addImage({ data: itemCanvas.toDataURL('image/png'), x, y, w: displayW, h: displayH });
      }

      await pptx.writeFile({ fileName: `${relatorio.titulo.replace(/[^a-zA-Z0-9À-ú\s]/g, '')}.pptx` });
    } catch (err) {
      console.error('Erro ao exportar PPTX:', err);
    } finally {
      setExportingPptx(false);
    }
  };

  const handleToggleColuna = (id: string, current: 0 | 1 | 2) => {
    updateColuna(id, current === 0 ? 1 : 0);
  };

  const canvasActions = {
    onMoveUp: (id: string) => reorderItem(id, 'up'),
    onMoveDown: (id: string) => reorderItem(id, 'down'),
    onDelete: (id: string) => deleteItem(id),
    onToggleColuna: handleToggleColuna,
    onUpdateText: (id: string, content: string) => updateTextItem(id, content),
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={titleValue}
                onChange={e => setTitleValue(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                className="text-xl font-bold text-gray-900 border-b-2 border-[#C0392B] focus:outline-none bg-transparent"
              />
              <button onClick={handleSaveTitle} className="text-green-600 p-1">
                <Check size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{relatorio.titulo}</h2>
              <button onClick={() => setEditingTitle(true)} className="text-gray-400 hover:text-gray-600 p-1">
                <Pencil size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowWidgetPicker(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#C0392B] hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors"
          >
            <Plus size={16} /> Widget
          </button>
          <button
            onClick={() => setShowTextEditor(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition-colors"
          >
            <Type size={16} /> Texto
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf || exportingPptx || itens.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-40"
          >
            {exportingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
            {exportingPdf ? 'Gerando...' : 'Exportar PDF'}
          </button>
          <button
            onClick={handleExportPptx}
            disabled={exportingPptx || exportingPdf || itens.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-40"
          >
            {exportingPptx ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
            {exportingPptx ? 'Gerando...' : 'Exportar PPTX'}
          </button>
        </div>
      </div>

      {/* Period info */}
      {(periodoInicio || periodoFim) && (
        <p className="text-xs text-gray-500 -mt-2">
          Período de referência: <strong>{periodoInicio || '—'}</strong> a <strong>{periodoFim || '—'}</strong>
          {' '}· Dados capturados no momento da adição de cada widget.
        </p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>
      )}

      {/* Canvas */}
      <div ref={canvasRef} id="relatorio-canvas">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 size={24} className="animate-spin mr-2" /> Carregando...
          </div>
        ) : (
          <CanvasActionsProvider value={canvasActions}>
            <CanvasArea itens={itens} />
          </CanvasActionsProvider>
        )}
      </div>

      {/* Modals */}
      {showWidgetPicker && (
        <WidgetPicker
          periodoInicio={periodoInicio}
          periodoFim={periodoFim}
          onAdd={handleAddWidget}
          onClose={() => setShowWidgetPicker(false)}
        />
      )}
      {showTextEditor && (
        <TextBlockEditor
          onSave={handleAddText}
          onClose={() => setShowTextEditor(false)}
        />
      )}
    </div>
  );
}
