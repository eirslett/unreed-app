import { Layout, LayoutTopbar, LayoutContent } from './Layout';
import { Example as TopbarExample } from '../Topbar/Topbar.stories';

export default {
  title: 'Layout',
};

function VeryTallBox() {
  return (
    <div style={{ height: '120vh', background: 'lightgrey' }}>
      Placeholder content here
    </div>
  );
}

export function Example() {
  return (
    <Layout>
      <LayoutTopbar>
        <TopbarExample />
      </LayoutTopbar>
      <LayoutContent>
        <VeryTallBox />
      </LayoutContent>
    </Layout>
  );
}
