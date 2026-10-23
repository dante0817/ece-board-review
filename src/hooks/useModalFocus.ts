import { useEffect, useRef } from 'react';

/** Keyboard focus containment and restoration for existing application dialogs. */
export function useModalFocus<T extends HTMLElement>(open: boolean, onEscape: () => void) {
  const container = useRef<T>(null);
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = container.current;
    if (!dialog) return;
    const selector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(selector))
      .filter(el => el.getClientRects().length > 0 && el.getAttribute('aria-hidden') !== 'true');
    (focusable()[0] || dialog).focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault(); event.stopPropagation(); onEscapeRef.current(); return;
      }
      if (event.key !== 'Tab') return;
      const els = focusable();
      if (!els.length) {event.preventDefault(); dialog.focus(); return;}
      const first = els[0], last = els[els.length-1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', keydown, true);
    return () => {
      document.removeEventListener('keydown', keydown, true);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);
  return container;
}
