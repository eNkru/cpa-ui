import { useEffect, useRef, useState } from 'react';
import { Menu, Submenu, MenuItem } from '@tauri-apps/api/menu';
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

  // Build native menu
  useEffect(() => {
    let mounted = true;

    const buildMenu = async () => {
      const reloadItem = await MenuItem.new({
        id: 'reload',
        text: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        action: () => webviewRef.current?.reload(),
      });

      const settingsItem = await MenuItem.new({
        id: 'settings',
        text: 'Settings...',
        accelerator: 'CmdOrCtrl+,',
        action: () => setShowConfig(true),
      });

      const appSubmenu = await Submenu.new({
        text: 'App',
        items: [reloadItem, settingsItem],
      });

      const menu = await Menu.new({ items: [appSubmenu] });
      if (mounted) await menu.setAsAppMenu();
    };

    buildMenu().catch(console.error);
    return () => { mounted = false; };
  }, []);

  const handleSave = (newUrl: string) => {
    setManagementUrl(newUrl);
    setShowConfig(false);
    setTimeout(() => webviewRef.current?.reload(), 50);
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      <WebViewArea ref={webviewRef} managementUrl={managementUrl} />
      {showConfig && (
        <ConfigModal
          currentUrl={managementUrl}
          onSave={handleSave}
          onClose={() => setShowConfig(false)}
        />
      )}
    </div>
  );
}

export default App;
