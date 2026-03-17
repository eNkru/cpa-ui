import { useState } from 'react';
import { saveConfig } from '../lib/tauri';

interface ConfigModalProps {
  currentUrl: string;
  onSave: (url: string) => void;
  onClose: () => void;
}

export function validateUrl(url: string): string | null {
  return /^https?:\/\/.+/.test(url) ? null : 'URL must start with http:// or https://';
}

export default function ConfigModal({ currentUrl, onSave, onClose }: ConfigModalProps) {
  const [url, setUrl] = useState(currentUrl);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const validationError = validateUrl(url);
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      await saveConfig(url);
      onSave(url);
      onClose();
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Configure Management URL"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', minWidth: '360px' }}>
        <h2 style={{ margin: '0 0 16px' }}>Management URL</h2>
        <input
          type="text"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(null); }}
          aria-label="Management URL"
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
        {error && (
          <p role="alert" style={{ color: 'red', margin: '8px 0 0', fontSize: '0.875rem' }}>
            {error}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}
