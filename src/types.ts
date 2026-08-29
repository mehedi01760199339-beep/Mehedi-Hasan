export interface NetworkStatus {
  isOnline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  lastChecked: Date;
  isSimulatedOffline?: boolean;
}

export type ViewMode = 'phone' | 'fullscreen';

export type ActiveTab = 'webview' | 'code' | 'settings';
