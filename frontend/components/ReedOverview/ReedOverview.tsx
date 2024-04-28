import { useUsername } from '../Auth/Auth';
import { useData } from '../Data/Data';
import { Layout, LayoutTopbar, LayoutContent } from '../Layout/Layout';
import { ReedSummary } from '../ReedSummary/ReedSummary';
import { Topbar } from '../Topbar/Topbar';

export function ReedOverview() {
  const username = useUsername();
  const data = useData();
  return (
    <Layout>
      <LayoutTopbar>
        <Topbar />
      </LayoutTopbar>
      <LayoutContent>
        <div className="reed-overview__grid">
          {data.reeds.recentReeds.map((id) => (
            <ReedSummary key={id} id={id} {...data.reeds.reeds[id]} />
          ))}
        </div>
      </LayoutContent>
    </Layout>
  );
}
