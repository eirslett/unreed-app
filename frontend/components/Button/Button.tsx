import clsx from 'clsx';

export type ButtonProps = {
  children?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant: 'primary' | 'secondary' | 'warning';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  form?: string;
};

export function Button({ children, type, variant, onClick, form }: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx('button', variant === 'warning' && 'button--warning')}
      onClick={onClick}
      form={form}
    >
      {children}
    </button>
  );
}
