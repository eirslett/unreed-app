import { useEffect, useRef, useState } from 'react';

export function Textarea({
  id,
  name,
  autoFocus,
  value,
  defaultValue,
  placeholder,
  onChange,
}: {
  id?: string;
  name?: string;
  autoFocus?: boolean;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? '');

  useEffect(() => {
    if (ref.current) {
      if (autoFocus) {
        ref.current.setAttribute('autofocus', 'true');
      }
      ref.current.value = value ?? defaultValue ?? '';

      function resetListener() {
        setInternalValue(value ?? defaultValue ?? '');
      }
      ref.current.form?.addEventListener('reset', resetListener);
      return () => {
        ref.current?.form?.removeEventListener('reset', resetListener);
      };
    }
  }, []);

  const replicatedValueOrPlaceholder = internalValue === '' ? placeholder : internalValue;

  return (
    <div className="textarea__wrapper" data-replicated-value={replicatedValueOrPlaceholder}>
      <textarea
        ref={ref}
        id={id}
        name={name}
        className="textarea__input"
        defaultValue={defaultValue}
        placeholder={placeholder}
        value={value}
        onChange={(ev) => {
          setInternalValue(ev.target.value);
          onChange?.(ev);
        }}
      />
    </div>
  );
}
