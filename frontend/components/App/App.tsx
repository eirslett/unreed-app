import { StrictMode, ReactNode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Auth } from '../Auth/Auth';
import { Layout, LayoutTopbar, LayoutContent } from '../Layout/Layout';
import { ReedOverview } from '../ReedOverview/ReedOverview';
import { Topbar } from '../Topbar/Topbar';
import { Data } from '../Data/Data';
import { ReedRoute } from '../ReedPage/ReedPage';

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
    path: '/reed/:id',
    element: (
      <Shell>
        <ReedRoute />
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
        <Data>
          <RouterProvider router={router} />
        </Data>
      </Auth>
    </StrictMode>
  );
}
