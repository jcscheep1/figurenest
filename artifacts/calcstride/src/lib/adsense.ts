export const ADSENSE_CLIENT_ID = 'ca-pub-8048023190382309';
export const ADSENSE_SCRIPT_ID = 'figurenest-adsense';
export const ADSENSE_SCRIPT_URL = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
export const ADSENSE_ADS_TXT_RECORD = 'google.com, pub-8048023190382309, DIRECT, f08c47fec0942fa0';
export const ADSENSE_PRODUCTION_HOSTS = ['figurenest.com', 'www.figurenest.com'] as const;
export const ADSENSE_STATUS_EVENT = 'figurenest:adsense-status';

declare global {
  interface Window {
    __figurenestAdSenseStatus?: 'loading' | 'ready' | 'failed';
  }
}

export function getAdSenseStatus(): 'loading' | 'ready' | 'failed' | null {
  if (typeof window === 'undefined') return null;
  const status = window.__figurenestAdSenseStatus;
  return status === 'loading' || status === 'ready' || status === 'failed' ? status : null;
}

export function disableAdvertisingProvider(): void {
  if (typeof window === 'undefined') return;
  document.getElementById(ADSENSE_SCRIPT_ID)?.remove();
  document.querySelector('meta[name="google-adsense-account"]')?.remove();
  delete (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle;
  delete window.__figurenestAdSenseStatus;
  window.dispatchEvent(new Event(ADSENSE_STATUS_EVENT));
}

export function renderAdSenseHead(): string {
  const hosts = JSON.stringify(ADSENSE_PRODUCTION_HOSTS);
  return [
    `<meta name="google-adsense-account" content="${ADSENSE_CLIENT_ID}" />`,
    `<script id="figurenest-adsense-bootstrap">(function(){if(!${hosts}.includes(window.location.hostname.toLowerCase()))return;var start=function(){if(document.getElementById('${ADSENSE_SCRIPT_ID}'))return;var notify=function(){window.dispatchEvent(new Event('${ADSENSE_STATUS_EVENT}'))};var script=document.createElement('script');window.__figurenestAdSenseStatus='loading';script.id='${ADSENSE_SCRIPT_ID}';script.async=true;script.src='${ADSENSE_SCRIPT_URL}';script.crossOrigin='anonymous';script.onload=function(){window.__figurenestAdSenseStatus='ready';notify()};script.onerror=function(){window.__figurenestAdSenseStatus='failed';notify()};document.head.appendChild(script)};if('requestIdleCallback'in window)requestIdleCallback(start,{timeout:2500});else setTimeout(start,2000)}());</script>`,
  ].join('\n    ');
}
