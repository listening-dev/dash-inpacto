import React, { useState, useRef } from 'react';
import { X, Upload, AlertTriangle, Loader2, CheckCircle, ImageIcon, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import axios from 'axios';

const N8N_WEBHOOK_URL = process.env.REACT_APP_N8N_BUG_REPORT_WEBHOOK || '';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | undefined;
  userId: string | undefined;
}

const CATEGORIES = [
  { value: 'dados_incorretos', label: 'Dados incorretos' },
  { value: 'erro_visual', label: 'Erro visual / Layout quebrado' },
  { value: 'funcionalidade_quebrada', label: 'Funcionalidade não funciona' },
  { value: 'lentidao', label: 'Lentidão / Performance' },
  { value: 'acesso', label: 'Problema de acesso / Login' },
  { value: 'outro', label: 'Outro' },
];

const BugReportModal: React.FC<BugReportModalProps> = ({ isOpen, onClose, userEmail, userId }) => {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'A imagem deve ter no máximo 5MB.' });
      return;
    }
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'O arquivo deve ser uma imagem (PNG, JPG, etc).' });
      return;
    }
    setImageFile(file);
    setFeedback({ type: '', message: '' });
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) processFile(file);
        return;
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setCategory('');
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
    setFeedback({ type: '', message: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      setFeedback({ type: 'error', message: 'Selecione uma categoria.' });
      return;
    }
    if (!description.trim()) {
      setFeedback({ type: 'error', message: 'Descreva o problema encontrado.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${userId || 'anon'}_${Date.now()}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('bug-reports')
          .upload(filePath, imageFile, { contentType: imageFile.type });

        if (uploadError) throw new Error(`Erro ao enviar imagem: ${uploadError.message}`);

        const { data: urlData } = supabase.storage
          .from('bug-reports')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from('bug_reports')
        .insert({
          user_id: userId || null,
          user_email: userEmail || 'desconhecido',
          category,
          category_label: CATEGORIES.find(c => c.value === category)?.label || category,
          description: description.trim(),
          image_url: imageUrl,
          page_url: window.location.href,
          user_agent: navigator.userAgent,
        });

      if (insertError) throw new Error(`Erro ao salvar report: ${insertError.message}`);

      if (N8N_WEBHOOK_URL) {
        try {
          await axios.post(N8N_WEBHOOK_URL, {
            user_email: userEmail || 'desconhecido',
            category: CATEGORIES.find(c => c.value === category)?.label || category,
            description: description.trim(),
            image_url: imageUrl,
            page_url: window.location.href,
            created_at: new Date().toISOString(),
          });
        } catch {
          console.warn('Falha ao enviar e-mail de notificação, mas o report foi salvo.');
        }
      }

      setFeedback({ type: 'success', message: 'Report enviado com sucesso! Obrigado pelo feedback.' });
      setTimeout(() => { resetForm(); onClose(); }, 2000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao enviar o report.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => { resetForm(); onClose(); }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <AlertTriangle size={20} className="text-[#C0392B]" />
          Reportar Problema
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Descreva o erro ou problema encontrado no dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {feedback.message && (
            <div className={`p-3 text-sm rounded-lg flex items-center gap-2 ${
              feedback.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}>
              {feedback.type === 'success' && <CheckCircle size={16} />}
              {feedback.type === 'error' && <AlertTriangle size={16} />}
              {feedback.message}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Categoria do Problema</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:outline-none bg-white text-gray-900 text-sm"
            >
              <option value="">Selecione uma categoria...</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Descrição do Problema</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que está acontecendo, qual página estava acessando, o que esperava ver..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:outline-none resize-none text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Captura de Tela (opcional)</label>
            {!imagePreview ? (
              <div
                ref={dropZoneRef}
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onPaste={handlePaste}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors outline-none
                  ${isDragging
                    ? 'border-[#C0392B] bg-red-50/50'
                    : 'border-gray-200 hover:border-[#C0392B]/50 hover:bg-red-50/30'
                  }`}
              >
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Clique para anexar ou <strong>Ctrl+V</strong> para colar</span>
                <span className="text-xs text-gray-400 mt-1">Também aceita arrastar e soltar — PNG, JPG — máx. 5MB</span>
              </div>
            ) : (
              <div className="relative border border-gray-200 rounded-lg overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-contain bg-gray-50" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-md"
                >
                  <Trash2 size={14} />
                </button>
                <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-500">
                  <ImageIcon size={14} />
                  {imageFile?.name}
                </div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#C0392B] hover:bg-[#A93226] text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 size={16} className="animate-spin" /> Enviando...</>
            ) : (
              'Enviar Report'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BugReportModal;
