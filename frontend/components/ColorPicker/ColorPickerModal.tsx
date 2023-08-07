import { ReactNode, KeyboardEvent, MouseEvent, useEffect, useRef } from 'react';

export function Modal({ children, onClose }: { children?: ReactNode; onClose?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const oldRef = useRef<Element>(document.activeElement);

  function handleKeyDown(ev: KeyboardEvent) {
    // Close on escape
    if (ev.key === 'Escape') {
      onClose?.();
    }
    // handle tab focus lock
    if (ev.key === 'Tab') {
      // find next focusable inside the modal
      const focusable =
        ref.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [];
      const firstFocusable = focusable[0] as HTMLElement;
      const lastFocusable = focusable[focusable.length - 1] as HTMLElement;

      // focus on next element, or back to first
      if (ev.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          ev.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          ev.preventDefault();
        }
      }
    }
  }

  useEffect(() => {
    ref.current?.focus();
    return () => {
      if (oldRef.current instanceof HTMLElement) {
        oldRef.current.focus();
      } else {
        document.body.focus();
      }
    };
  });

  function handleInnerClick(ev: MouseEvent) {
    ev.stopPropagation();
  }

  return (
    <div className="color-picker__modal__backdrop" onClick={onClose} onKeyDown={handleKeyDown}>
      <div
        ref={ref}
        tabIndex={-1}
        className="color-picker__modal__inner"
        onClick={handleInnerClick}
      >
        {children}
      </div>
    </div>
  );
}
