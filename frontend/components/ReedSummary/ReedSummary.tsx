import { ReedMeta } from '../../types';

export function ReedSummary(data: ReedMeta) {
  const information = [];
  if (data.caneProducer) {
    information.push(data.caneProducer);
  }
  if (data.caneDiameter) {
    information.push('⌀: ' + data.caneDiameter);
  }

  if (data.caneHardness) {
    information.push('hardness: ' + data.caneHardness);
  }

  if (data.caneDensity) {
    information.push('density: ' + data.caneDensity);
  }

  if (data.gougeThickness) {
    information.push('gouge: ' + data.gougeThickness);
  }

  if (data.shaperForm) {
    information.push('shape: ' + data.shaperForm);
  }

  const cane =
    information.length > 0 ? 'Cane: ' + information.map((str) => str + '').join(', ') + '.' : '';
  const stapleInformation = [];
  if (data.stapleModel) {
    stapleInformation.push(data.stapleModel);
  }
  if (data.stapleLength) {
    stapleInformation.push(data.stapleLength);
  }
  const staple =
    stapleInformation.length > 0 ? 'Staple: ' + stapleInformation.join(', ') + '.' : '';

  return (
    <div className="reed-summary">
      {cane} {staple}
    </div>
  );
}
