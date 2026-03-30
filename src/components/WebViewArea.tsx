import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Webview } from '@tauri-apps/api/webview';
import { getCurrentWindow, LogicalPosition, LogicalSize } from '@tauri-apps/api/window';

export interface WebViewAreaHandle {
  reload: () => void;
  hide: () => Promise<void>;
  show: () => Promise<void>;
}

interface WebViewAreaProps {
  managementUrl: string;
}

const LABEL = 'content-webview';

async function getLogicalSize() {
  const win = getCurrentWindow();
  const size = await win.innerSize();
  const scale = await win.scaleFactor();
  return { width: size.width / scale, height: size.height / scale };
}

async function closeExisting() {
  try {
    const existing = await Webview.getByLabel(LABEL);
    if (existing) await existing.close();
  } catch {
    // didn't exist, fine
  }
}

async function spawnWebview(url: string): Promise<Webview> {
  await closeExisting();

  const win = getCurrentWindow();
  const { width, height } = await getLogicalSize();

  return new Promise<Webview>((resolve, reject) => {
    const wv = new Webview(win, LABEL, { url, x: 0, y: 0, width, height });
    wv.once('tauri://created', () => resolve(wv));
    wv.once('tauri://error', (e) => reject(new Error(String((e as any)?.payload ?? e))));
  });
}

const WebViewArea = forwardRef<WebViewAreaHandle, WebViewAreaProps>(
  ({ managementUrl }, ref) => {
    const webviewRef = useRef<Webview | null>(null);
    // token increments on each spawn attempt; stale callbacks check against it
    const tokenRef = useRef(0);

    const spawn = (url: string) => {
      const token = ++tokenRef.current;
      spawnWebview(url)
        .then((wv) => {
          if (tokenRef.current !== token) { wv.close(); return; }
          webviewRef.current = wv;
          wv.show(); // always show after spawn
        })
        .catch((e) => console.error('[WebViewArea] spawn failed:', e));
    };

    useImperativeHandle(ref, () => ({
      reload: () => spawn(managementUrl),
      hide: () => webviewRef.current?.hide() ?? Promise.resolve(),
      show: () => webviewRef.current?.show() ?? Promise.resolve(),
    }));

    useEffect(() => {
      // small delay on mount to let the window finish rendering before spawning
      const t = setTimeout(() => spawn(managementUrl), 100);
      return () => {
        clearTimeout(t);
        tokenRef.current++;
        webviewRef.current?.close();
        webviewRef.current = null;
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [managementUrl]);

    useEffect(() => {
      const win = getCurrentWindow();
      const unlistens: (() => void)[] = [];

      win.onResized(async () => {
        const wv = webviewRef.current;
        if (!wv) return;
        const { width, height } = await getLogicalSize();
        await wv.setPosition(new LogicalPosition(0, 0));
        await wv.setSize(new LogicalSize(width, height));
      }).then((fn) => { unlistens.push(fn); });

      // When the window is restored/focused, ensure the webview is visible.
      // Only respawn if it's somehow gone (e.g. crashed), not on every focus.
      win.onFocusChanged(async ({ payload: focused }) => {
        if (!focused) return;
        const wv = webviewRef.current;
        if (wv) {
          await wv.show();
        }
      }).then((fn) => { unlistens.push(fn); });

      return () => { unlistens.forEach((fn) => fn()); };
    }, []);

    return <div data-testid="webview" style={{ flex: 1, width: '100%' }} />;
  }
);

WebViewArea.displayName = 'WebViewArea';

export default WebViewArea;
