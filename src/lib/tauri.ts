import { invoke } from '@tauri-apps/api/core';

export interface AppConfig {
  managementUrl: string;
}

export const DEFAULT_URL = 'http://localhost:8317/management.html#/';

export async function getConfig(): Promise<AppConfig> {
  return invoke<AppConfig>('get_config');
}

export async function saveConfig(url: string): Promise<void> {
  return invoke('save_config', { url });
}
