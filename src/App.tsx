import { useEffect, useRef, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { getConfig, DEFAULT_URL } from './lib/tauri';
import WebViewArea, { WebViewAreaHandle } from './components/WebViewArea';
import ConfigModal from './components/ConfigModal';

function App() {
  const [managementUrl, setManagementUrl] = useState(DEFAULT_URL);
  const [showConfig, setShowConfig] = useState(false);
  const webviewRef = useRef<WebViewAreaHandle>(null);

  useEffect(() => {
    getConfig()
      .then((config) => setManagementUrl(config.managementUrl))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const unlistenPromises = [
      listen('menu:reload', () => webviewRef.current?.reload()),
      listen('menu:settings', async () => {
        await webviewRef.current?.hide();
        setShowConfig(true);
      }),
    ];
    return () => {
      unlistenPromises.forEach((p) => p.then((fn) => fn()));
    };
  }, []);

  const handleSave = (newUrl: string) => {
    setShowConfig(false);
    setManagementUrl(newUrl); // triggers WebViewArea to respawn with new URL
  };

  const handleClose = () => {
    setShowConfig(false);
    webviewRef.current?.show();
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <WebViewArea ref={webviewRef} managementUrl={managementUrl} />
      {showConfig && (
        <ConfigModal
          currentUrl={managementUrl}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

export default App;
