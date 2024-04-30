import { StoryFn } from '@storybook/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import '../frontend/index.css';

function MemoryDataRouter({ Story }: { Story: StoryFn }) {
  const router = createMemoryRouter([
    {
      path: '*',
      element: <Story />,
    },
  ]);
  return <RouterProvider router={router} />;
}

export const decorators = [(Story: StoryFn) => <MemoryDataRouter Story={Story} />];
