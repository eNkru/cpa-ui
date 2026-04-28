import { useState } from 'react';
import { saveConfig } from '../lib/tauri';

interface ConfigModalProps {
  currentHost: string;
  currentPort: number;
  onSave: (host: string, port: number) => void;
  onClose: () => void;
}

export function validateHost(host: string): string | null {
  if (!host.trim()) return 'Host cannot be empty';
  return null;
}

export function validatePort(port: number): string | null {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return 'Port must be between 1 and 65535';
  }
  return null;
}

export default function ConfigModal({ currentHost, currentPort, onSave, onClose }: ConfigModalProps) {
  const [host, setHost] = useState(currentHost);
  const [portStr, setPortStr] = useState(String(currentPort));
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const hostError = validateHost(host);
    if (hostError) {
      setError(hostError);
      return;
    }

    const port = Number(portStr);
    const portError = validatePort(port);
    if (portError) {
      setError(portError);
      return;
    }

    try {
      await saveConfig(host, port);
      onSave(host, port);
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
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <div style={{ flex: 2 }}>
            <label htmlFor="config-host" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Host</label>
            <input
              id="config-host"
              type="text"
              value={host}
              onChange={(e) => { setHost(e.target.value); setError(null); }}
              aria-label="Host"
              placeholder="localhost"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="config-port" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px' }}>Port</label>
            <input
              id="config-port"
              type="number"
              value={portStr}
              onChange={(e) => { setPortStr(e.target.value); setError(null); }}
              aria-label="Port"
              placeholder="8317"
              min={1}
              max={65535}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
        </div>
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
