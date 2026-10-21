import { useState, useEffect, useRef } from 'react';

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
    <div className="product-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-desc-title">
      <div className="product-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="product-modal-header">
          <div>
            <h3 className="product-modal-title" id="modal-desc-title">Editor Deskripsi Produk</h3>
            <p className="product-modal-sub">Lengkapi deskripsi menu surplus makanan agar pembeli lebih yakin</p>
          </div>
          <button
            type="button"
            className="product-modal-close-btn"
            aria-label="Tutup Editor"
            onClick={onClose}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Preset Templates */}
        <div className="product-modal-presets">
          <span className="preset-label">Template Cepat:</span>
          <div className="preset-tags">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                className="preset-chip"
                onClick={() => handleApplyTemplate(tpl.content)}
              >
                + {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar & Tabs */}
        <div className="product-modal-toolbar">
          <div className="toolbar-tools">
            <button
              type="button"
              className="toolbar-btn"
              title="Tebal"
              onClick={() => insertFormatting('**', '**')}
            >
              <b>B</b>
            </button>
            <button
              type="button"
              className="toolbar-btn italic-tool"
              title="Miring"
              onClick={() => insertFormatting('*', '*')}
            >
              <i>I</i>
            </button>
            <button
              type="button"
              className="toolbar-btn"
              title="Poin Bullet"
              onClick={() => insertFormatting('\n• ')}
            >
              • List
            </button>
            <button
              type="button"
              className="toolbar-btn clear-tool"
              title="Bersihkan Teks"
              onClick={() => setText('')}
            >
              Hapus Semua
            </button>
          </div>

          <div className="toolbar-tabs">
            <button
              type="button"
              className={`toolbar-tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              Editor
            </button>
            <button
              type="button"
              className={`toolbar-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              Pratinjau
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="product-modal-body">
          {activeTab === 'editor' ? (
            <textarea
              ref={textareaRef}
              className="product-modal-textarea"
              placeholder="Tuliskan deskripsi produk, variasi menu, atau catatan pengambilan di sini..."
              value={text}
              maxLength={1200}
              onChange={(e) => setText(e.target.value)}
              rows={8}
            />
          ) : (
            <div className="product-modal-preview">
              {text.trim() ? (
                <div className="preview-content-rendered">
                  {text.split('\n').map((line, idx) => (
                    <p key={idx} className={line.trim() ? 'preview-paragraph' : 'preview-spacer'}>
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="preview-empty">Belum ada deskripsi yang ditulis. Kembali ke tab Editor untuk menulis.</div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="product-modal-footer">
          <div className="char-counter">
            <span className={text.length > 1000 ? 'text-amber-600 font-semibold' : ''}>
              {text.length}
            </span>{' '}
            / 1200 karakter
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Batal
            </button>
            <button type="button" className="btn-modal-save" onClick={handleSave}>
              Terapkan Deskripsi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
