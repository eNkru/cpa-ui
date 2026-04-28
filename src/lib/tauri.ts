import { invoke } from '@tauri-apps/api/core';

export interface AppConfig {
  host: string;
  port: number;
}

export const DEFAULT_HOST = 'localhost';
export const DEFAULT_PORT = 8317;
export const MANAGEMENT_PATH = '/management.html#/';

export function buildManagementUrl(host: string, port: number): string {
  return `http://${host}:${port}${MANAGEMENT_PATH}`;
}

export async function getConfig(): Promise<AppConfig> {
  return invoke<AppConfig>('get_config');
}

export async function saveConfig(host: string, port: number): Promise<void> {
  return invoke('save_config', { host, port });
}
