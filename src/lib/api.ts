export const API_URL = "https://paibp.pages.dev";

export function getApiUrl(path: string): string {
  // Check if running in Electron
  const isElectron = typeof window !== 'undefined' && window.navigator.userAgent.toLowerCase().includes(' electron/');
  
  if (isElectron) {
    return `${API_URL}${path}`;
  }
  
  // Default for Web/PWA
  return path;
}
