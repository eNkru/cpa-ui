import { useEffect, useRef, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { getConfig, buildManagementUrl, DEFAULT_HOST, DEFAULT_PORT } from './lib/tauri';
import WebViewArea, { WebViewAreaHandle } from './components/WebViewArea';
import ConfigModal from './components/ConfigModal';

function App() {
  const [host, setHost] = useState(DEFAULT_HOST);
  const [port, setPort] = useState(DEFAULT_PORT);
  const [showConfig, setShowConfig] = useState(false);
  const webviewRef = useRef<WebViewAreaHandle>(null);

  const managementUrl = buildManagementUrl(host, port);

  useEffect(() => {
    getConfig()
      .then((config) => {
        setHost(config.host);
        setPort(config.port);
      })
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

  const handleSave = (newHost: string, newPort: number) => {
    setShowConfig(false);
    setHost(newHost);
    setPort(newPort);
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
          currentHost={host}
          currentPort={port}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

export default App;
