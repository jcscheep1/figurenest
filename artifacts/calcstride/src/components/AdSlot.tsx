import { useEffect, useRef, useState } from 'react';
import { ADSENSE_STATUS_EVENT, getAdSenseStatus } from '@/lib/adsense';
import { monetizationConfig } from '@/lib/monetization-config';

type GoogleFc = {
  callbackQueue?: Array<Record<string, () => void>>;
  getGoogleConsentModeValues?: () => {
    adStoragePurposeConsentStatus?: number;
    adUserDataPurposeConsentStatus?: number;
    adPersonalizationPurposeConsentStatus?: number;
  };
  ConsentModePurposeStatusEnum?: {
    GRANTED?: number;
    NOT_APPLICABLE?: number;
  };
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
    googlefc?: GoogleFc;
  }
}

function advertisingIsAllowed(): boolean {
  const googlefc = window.googlefc;
  const values = googlefc?.getGoogleConsentModeValues?.();
  const statuses = googlefc?.ConsentModePurposeStatusEnum;
  if (!values || !statuses) return false;
  const allowed = new Set([statuses.GRANTED, statuses.NOT_APPLICABLE]);
  return [
    values.adStoragePurposeConsentStatus,
    values.adUserDataPurposeConsentStatus,
    values.adPersonalizationPurposeConsentStatus,
  ].every((status) => status !== undefined && allowed.has(status));
}

export function AdSlot({ eligible = true }: { eligible?: boolean }) {
  const [providerStatus, setProviderStatus] = useState(getAdSenseStatus);
  const [consentAllowsAds, setConsentAllowsAds] = useState(false);
  const [filled, setFilled] = useState(true);
  const [attempted, setAttempted] = useState(false);
  const initialized = useRef(false);
  const adElement = useRef<HTMLModElement>(null);
  const slot = monetizationConfig.adsenseFooterSlot;

  useEffect(() => {
    const updateStatus = () => setProviderStatus(getAdSenseStatus());
    window.addEventListener(ADSENSE_STATUS_EVENT, updateStatus);
    return () => window.removeEventListener(ADSENSE_STATUS_EVENT, updateStatus);
  }, []);

  useEffect(() => {
    const updateConsent = () => setConsentAllowsAds(advertisingIsAllowed());
    window.googlefc = window.googlefc || {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
    window.googlefc.callbackQueue.push({ CONSENT_MODE_DATA_READY: updateConsent });
    updateConsent();
  }, []);

  useEffect(() => {
    if (!eligible || !consentAllowsAds) {
      initialized.current = false;
      setAttempted(false);
    }
  }, [eligible, consentAllowsAds]);

  useEffect(() => {
    if (!eligible || !consentAllowsAds || providerStatus !== 'ready' || !slot || initialized.current) return;
    try {
      setAttempted(true);
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      initialized.current = true;
    } catch {
      return;
    }
  }, [eligible, consentAllowsAds, providerStatus, slot]);

  useEffect(() => {
    const element = adElement.current;
    if (!element || !consentAllowsAds || providerStatus !== 'ready') return;
    const update = () => setFilled(element.getAttribute('data-ad-status') !== 'unfilled');
    update();
    const observer = new MutationObserver(update);
    observer.observe(element, { attributes: true, attributeFilter: ['data-ad-status'] });
    return () => observer.disconnect();
  }, [consentAllowsAds, providerStatus]);

  if (!eligible || !slot) return null;
  const ready = consentAllowsAds && providerStatus === 'ready';
  const showCreative = ready && filled;
  return <aside className={`ad-slot${attempted ? ' is-reserved' : ''}${showCreative ? ' is-active' : ''}`} aria-label={showCreative ? 'Advertisement' : undefined} aria-hidden={showCreative ? undefined : true}>
    {showCreative && <span className="mono">ADVERTISEMENT</span>}
    {ready && <ins ref={adElement} className="adsbygoogle" style={{ display: filled ? 'block' : 'none' }} data-ad-client={monetizationConfig.adsenseClientId} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />}
  </aside>;
}