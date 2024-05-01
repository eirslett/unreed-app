import clsx from 'clsx';

export type ButtonProps = {
  children?: React.ReactNode;
  variant: 'primary' | 'secondary' | 'warning';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export function Button({ children, variant, onClick }: ButtonProps) {
  return (
    <button
      className={clsx('button', variant === 'warning' && 'button--warning')}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
