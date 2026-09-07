import { useEffect } from 'react';
import { useLocation } from 'wouter';

function scrollToRouteStart() {
  const hash = window.location.hash;

  if (hash) {
    const targetId = decodeURIComponent(hash.slice(1));
    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView();
    });
    return;
  }

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    root.style.scrollBehavior = previousScrollBehavior;
  });
}

export function ScrollManager() {
  const [location] = useLocation();

  useEffect(() => {
    scrollToRouteStart();
  }, [location]);

  return null;
}