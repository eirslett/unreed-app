import { useEffect, useRef, useState } from 'react';

export function Textarea({
  name,
  autoFocus,
  value,
  defaultValue,
  placeholder,
  onChange,
}: {
  name?: string;
  autoFocus?: boolean;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.setAttribute('autofocus', 'true');
    }
  }, []);

  const replicatedValue = value ?? defaultValue ?? '';
  const replicatedValueOrPlaceholder = replicatedValue === '' ? placeholder : replicatedValue;

  return (
    <div className="textarea__wrapper" data-replicated-value={replicatedValueOrPlaceholder}>
      <textarea
        ref={ref}
        name={name}
        className="textarea__input"
        defaultValue={defaultValue}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
