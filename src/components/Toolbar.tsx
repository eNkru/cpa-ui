interface ToolbarProps {
  onReload: () => void;
  onSettings: () => void;
}

export default function Toolbar({ onReload, onSettings }: ToolbarProps) {
  return (
    <div
      style={{
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
        borderBottom: '1px solid #ccc',
        background: '#f5f5f5',
        flexShrink: 0,
      }}
    >
      <button onClick={onReload} aria-label="Reload">↺ Reload</button>
      <button onClick={onSettings} aria-label="Settings">⚙ Settings</button>
    </div>
  );
}
