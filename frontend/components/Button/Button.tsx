import clsx from 'clsx';

export type ButtonProps = {
  children?: React.ReactNode;
  variant: 'primary' | 'secondary' | 'warning';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  form?: string;
};

export function Button({ children, variant, onClick, form }: ButtonProps) {
  return (
    <button
      className={clsx('button', variant === 'warning' && 'button--warning')}
      onClick={onClick}
      form={form}
    >
      {children}
    </button>
  );
}
