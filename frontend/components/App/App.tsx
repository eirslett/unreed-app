import { StrictMode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout, LayoutTopbar, LayoutContent } from '../Layout/Layout';
import { Topbar } from '../Topbar/Topbar';

const router = createBrowserRouter([
  {
    path: '/',
    element: <div>Hello world!</div>,
  },
]);

export function App() {
  return (
    <StrictMode>
      <Layout>
        <LayoutTopbar>
          <Topbar />
        </LayoutTopbar>
        <LayoutContent>
          <RouterProvider router={router} />
        </LayoutContent>
      </Layout>
    </StrictMode>
  );
}
