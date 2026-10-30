import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { FormattedDescription } from '../common/FormattedDescription';

export interface ProductDescriptionModalProps {
  isOpen: boolean;
  initialValue: string;
  onSave: (value: string) => void;
  onClose: () => void;
}

const TEMPLATES = [
  {
    label: 'Mystery Box Standar',
    content:
      'Berisi 1 porsi makanan berat surplus hari ini dengan rasa dan kualitas terjamin. Disiapkan langsung oleh chef dan aman dikonsumsi hingga 4 jam setelah pengambilan.',
  },
  {
    label: 'Roti & Pastry',
    content:
      'Kombinasi 3-4 aneka roti manis, croissant, dan pastry lezat yang dipanggang segar hari ini. Cocok dinikmati bersama teh atau kopi.',
  },
  {
    label: 'Bento & Lauk Komplit',
    content:
      'Paket bento bergizi lengkap dengan nasi, 2 jenis lauk (ayam/daging/ikan), sayuran segar, dan sambal khas restoran.',
  },
  {
    label: 'Peringatan Alergen',
    content:
      'Catatan Alergen: Mungkin mengandung gluten, telur, atau kacang-kacangan. Mohon hubungi merchant via WhatsApp jika memiliki alergi tertentu.',
  },
];

/**
 * ProductDescriptionModal
 * Rich modal editor for product description with quick presets, formatting helpers, and character counter.
 * Styled with Tailwind CSS classes.
 */
export function ProductDescriptionModal({
  isOpen,
  initialValue,
  onSave,
  onClose,
}: ProductDescriptionModalProps) {
  const [text, setText] = useState<string>(initialValue);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialValue);
      setActiveTab('editor');
    }
  }, [isOpen, initialValue]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = text.substring(start, end);
    const replacement = `${prefix}${selected || 'teks'}${suffix}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);

    setText(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
    }, 50);
  };

  const handleApplyTemplate = (content: string) => {
    if (text.trim() && !text.includes(content)) {
      setText((prev) => `${prev}\n\n${content}`);
    } else {
      setText(content);
    }
  };

  const handleSave = () => {
    onSave(text.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-1050 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-desc-title">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-display" id="modal-desc-title">Editor Deskripsi Produk</h3>
            <p className="text-xs text-gray-500">Lengkapi deskripsi menu surplus makanan agar pembeli lebih yakin</p>
          </div>
          <button
            type="button"
            className="w-9 h-9 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup Editor"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Templates */}
        <div className="p-3.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-bold text-gray-500 shrink-0">Template Cepat:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-black hover:text-black transition-colors cursor-pointer"
                onClick={() => handleApplyTemplate(tpl.content)}
              >
                + {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar & Tabs */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 border-b border-gray-100 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Tebal"
              onClick={() => insertFormatting('**', '**')}
            >
              <b>B</b>
            </button>
            <button
              type="button"
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer italic"
              title="Miring"
              onClick={() => insertFormatting('*', '*')}
            >
              I
            </button>
            <button
              type="button"
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Poin Bullet"
              onClick={() => insertFormatting('\n• ')}
            >
              • List
            </button>
            <button
              type="button"
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer ml-1"
              title="Bersihkan Teks"
              onClick={() => setText('')}
            >
              Hapus Semua
            </button>
          </div>

          <div className="flex items-center gap-1 bg-gray-200/60 p-0.5 rounded-xl">
            <button
              type="button"
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'editor' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              onClick={() => setActiveTab('editor')}
            >
              Editor
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'preview' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              onClick={() => setActiveTab('preview')}
            >
              Pratinjau
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="p-4 flex-1 min-h-55">
          {activeTab === 'editor' ? (
            <textarea
              ref={textareaRef}
              className="w-full h-full min-h-50 p-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-black transition-colors resize-none leading-relaxed"
              placeholder="Tuliskan deskripsi produk, variasi menu, atau catatan pengambilan di sini..."
              value={text}
              maxLength={1200}
              onChange={(e) => setText(e.target.value)}
              rows={8}
            />
          ) : (
            <div className="w-full min-h-50 p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-800">
              {text.trim() ? (
                <FormattedDescription content={text} />
              ) : (
                <div className="text-gray-400 text-xs italic text-center py-10">
                  Belum ada deskripsi yang ditulis. Kembali ke tab Editor untuk menulis.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="text-xs text-gray-500 font-medium">
            <span className={text.length > 1000 ? 'text-amber-600 font-bold' : ''}>
              {text.length}
            </span>{' '}
            / 1200 karakter
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer" onClick={onClose}>
              Batal
            </button>
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark active:scale-[0.98] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              onClick={handleSave}
            >
              Terapkan Deskripsi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
