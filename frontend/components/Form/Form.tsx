import { useEffect, useId, useRef } from 'react';

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

export function SelectField({
  name,
  label,
  children,
}: {
  name: string;
  label: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <Field>
      <label htmlFor={id}>{label}</label>
      <select id={id} name={name} className="input">
        {children}
      </select>
    </Field>
  );
}

export function TextField({
  name,
  label,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}) {
  const id = useId();
  return (
    <Field>
      <label htmlFor={id}>{label}</label>
      <Input id={id} name={name} type="text" placeholder={placeholder} required={required} />
    </Field>
  );
}
