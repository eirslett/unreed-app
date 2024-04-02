import { useUsername } from '../Auth/Auth';
import { Layout, LayoutTopbar, LayoutContent } from '../Layout/Layout';
import { Topbar } from '../Topbar/Topbar';

export function ReedOverview() {
  const username = useUsername();
  return (
    <Layout>
      <LayoutTopbar>
        <Topbar />
      </LayoutTopbar>
      <LayoutContent>Foo {username}</LayoutContent>
    </Layout>
  );
}
