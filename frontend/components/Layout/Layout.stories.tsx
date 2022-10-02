import { Layout, LayoutTopbar, LayoutContent } from './Layout';
import { Example as TopbarExample } from '../Topbar/Topbar.stories';
import { PlaceholderText } from './PlaceholderText';

export default {
  title: 'Layout',
};

function VeryTallBox() {
  return (
    <div style={{ minHeight: '120vh' }}>
      <PlaceholderText />
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
