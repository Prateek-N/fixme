import { useCallback, useRef, useState } from 'react';
import { Chip } from './Chip';

interface DropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function Dropzone({ onFile, disabled }: DropzoneProps) {
  const [dragover, setDragover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragover(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }, [onFile, disabled]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }, [onFile]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, [disabled]);

  return (
    <div
      className={`dropzone${dragover ? ' dragover' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragover(true); }}
      onDragLeave={() => setDragover(false)}
      onDrop={handleDrop}
      onClick={() => {
        if (!disabled) {
          inputRef.current?.click();
        }
      }}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Upload PDF bank statement"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleChange}
        hidden
      />
      <svg className="cloud-icon" viewBox="0 0 24 24">
        <path d="M12 3v14M6 9l6-6 6 6M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
      </svg>
      <div className="hand" style={{ fontSize: 18, color: 'var(--blue)', fontWeight: 700 }}>
        Drop PDF here
      </div>
      <div className="hand sub" style={{ fontSize: 13 }}>
        or <u>tap to browse</u>
      </div>
      <div className="row" style={{ gap: 6, marginTop: 8 }}>
        <Chip category="other" label="PDF" />
      </div>
    </div>
  );
}
