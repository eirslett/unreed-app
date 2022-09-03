import { ReedMeta } from '../../types';

export function ReedSummary(props: ReedMeta) {
  return (
    <div className="reed-summary">
      {props.name} ({props.color})
    </div>
  );
}
