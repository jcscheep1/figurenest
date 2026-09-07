import { useEffect, useRef, useState } from 'react';
import { getConsent, saveConsent, type ConsentPreferences } from '@/lib/consent';
import { configureConsent, trackEvent } from '@/lib/analytics';

export function ConsentManager() {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const manageButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const restoreFocusRef = useRef(false);

  useEffect(() => {
    const saved = getConsent();
    setPreferences(saved);
    configureConsent(saved);
    const openPreferences = () => {
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setShowSettings(true);
    };
    window.addEventListener('figurenest:open-consent', openPreferences);
    return () => window.removeEventListener('figurenest:open-consent', openPreferences);
  }, []);

  useEffect(() => {
    if (!showSettings) return;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>('[data-consent-focus]')?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        restoreFocusRef.current = true;
        setShowSettings(false);
      }
      if (event.key !== 'Tab' || !dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>('button, input:not(:disabled), [href], [tabindex]:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeIndex = focusable.indexOf(document.activeElement as HTMLElement);
      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && activeIndex <= 0) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeIndex === focusable.length - 1) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [showSettings]);

  useEffect(() => {
    if (showSettings || !restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    const target = returnFocusRef.current;
    if (target?.isConnected) target.focus();
    else manageButtonRef.current?.focus();
  }, [showSettings]);

  const commit = (next: ConsentPreferences) => {
    const revokedPreviouslyGrantedConsent = preferences?.analytics === true && !next.analytics;
    saveConsent(next);
    if (revokedPreviouslyGrantedConsent) {
      trackEvent('consent_updated', { action: 'withdrawn' });
    }
    configureConsent(next);
    if (preferences?.analytics !== true && next.analytics) {
      trackEvent('consent_updated', { action: 'granted' });
    }
    if (revokedPreviouslyGrantedConsent) {
      // A reload fully stops provider code that was already evaluated before
      // consent was withdrawn. The saved denied choice prevents it reloading.
      window.location.reload();
      return;
    }
    setPreferences(next);
    restoreFocusRef.current = showSettings;
    setShowSettings(false);
  };

  if (preferences && !showSettings) return null;
  const current: ConsentPreferences = preferences ?? { essential: true, analytics: false, advertising: false };
  return <div ref={dialogRef} className={`consent-panel${showSettings ? ' is-settings' : ''}`} role={showSettings ? 'dialog' : 'status'} aria-live={showSettings ? undefined : 'polite'} aria-modal={showSettings || undefined} aria-labelledby="consent-title" aria-describedby="consent-description">
    <div className="consent-copy">
      <strong id="consent-title">Your privacy choices</strong>
      <p id="consent-description">Choose whether FigureNest may use Google Analytics. Calculator inputs and results are never sent. Advertising choices are handled separately by Google’s certified consent platform where required.</p>
    </div>
    {showSettings && <div className="consent-options">
      <label htmlFor="consent-essential"><span><strong>Essential</strong><small>Needed to save this preference.</small></span><input id="consent-essential" type="checkbox" checked disabled /></label>
      <label htmlFor="consent-analytics"><span><strong>Analytics</strong><small>Helps us understand which tools are useful.</small></span><input id="consent-analytics" type="checkbox" checked={current.analytics} onChange={(event) => setPreferences({ ...current, analytics: event.target.checked })} /></label>
    </div>}
    <div className="consent-actions">
      {!showSettings && <button ref={manageButtonRef} className="consent-link" onClick={() => { returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setShowSettings(true); }}>Manage preferences</button>}
      <button data-consent-focus={showSettings || undefined} className="consent-choice" onClick={() => commit({ essential: true, analytics: false, advertising: false })}>Reject analytics</button>
      <button className="consent-choice" onClick={() => commit(showSettings ? { ...current, advertising: false } : { essential: true, analytics: true, advertising: false })}>{showSettings ? 'Save preferences' : 'Accept analytics'}</button>
    </div>
  </div>;
}

export function openConsentPreferences(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('figurenest:open-consent'));
}