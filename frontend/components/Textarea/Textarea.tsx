import { useEffect, useRef } from 'react';

export function Textarea({
  autoFocus,
  value,
  onChange,
}: {
  autoFocus?: boolean;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.setAttribute('autofocus', 'true');
    }
  }, []);

  return (
    <div className="textarea__wrapper" data-replicated-value={value}>
      <textarea ref={ref} className="textarea__input" value={value} onChange={onChange} />
    </div>
  );
}
