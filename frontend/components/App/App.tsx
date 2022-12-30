import { StrictMode, ReactNode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout, LayoutTopbar, LayoutContent } from '../Layout/Layout';
import { Topbar } from '../Topbar/Topbar';

function Shell({ children }: { children?: ReactNode }) {
  return (
    <Layout>
      <LayoutTopbar>
        <Topbar />
      </LayoutTopbar>
      <LayoutContent>{children}</LayoutContent>
    </Layout>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell>Hello world!</Shell>,
  },
  {
    path: '/new-reed',
    element: <Shell>New reed</Shell>,
  },
  {
    path: '/discarded',
    element: <Shell>Discarded</Shell>,
  },
]);

export function App() {
  return (
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}
