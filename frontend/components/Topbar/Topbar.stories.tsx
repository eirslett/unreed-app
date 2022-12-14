import { MemoryRouter } from 'react-router';
import { Topbar } from './Topbar';

export default {
  title: 'Top bar',
};

export function Example() {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Topbar />
    </MemoryRouter>
  );
}
