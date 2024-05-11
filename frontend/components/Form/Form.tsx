import { useEffect, useRef } from 'react';

export function Field({ children }: { children: React.ReactNode }) {
  return <div className="form-field">{children}</div>;
}

export function Input({ autoFocus, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  // Something is broken about React autofocus inside the dialogs - so handle it manually
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.setAttribute('autofocus', 'true');
    }
  }, []);
  return <input ref={ref} className="input" {...props} />;
}
