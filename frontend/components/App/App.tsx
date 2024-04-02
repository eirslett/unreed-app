import { StrictMode, ReactNode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Auth } from '../Auth/Auth';
import { Layout, LayoutTopbar, LayoutContent } from '../Layout/Layout';
import { ReedOverview } from '../ReedOverview/ReedOverview';
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
    element: (
      <Shell>
        <ReedOverview />
      </Shell>
    ),
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
      <Auth>
        <RouterProvider router={router} />
      </Auth>
    </StrictMode>
  );
}
