import { useEffect, useRef } from 'react';

export function Textarea({
  name,
  autoFocus,
  value,
  defaultValue,
  onChange,
}: {
  name?: string;
  autoFocus?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.setAttribute('autofocus', 'true');
    }
  }, []);

  return (
    <div className="textarea__wrapper" data-replicated-value={value}>
      <textarea
        ref={ref}
        name={name}
        className="textarea__input"
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
