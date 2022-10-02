import { ReactNode } from 'react';

export function Layout({ children }: { children?: ReactNode }) {
  return <div className="layout">{children}</div>;
}

export function LayoutTopbar({ children }: { children?: ReactNode }) {
  return <div className="layout__topbar">{children}</div>;
}

export function LayoutContent({ children }: { children?: ReactNode }) {
  return <div className="layout__content">{children}</div>;
}
