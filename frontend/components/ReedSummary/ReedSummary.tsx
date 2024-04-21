import { Reed, ReedData } from '../../types';
import { findColorHex } from '../ColorPicker/utils';
import { timestampToLocaleFormattedDate } from '../../utils/date';

function keyValue(key: string, value: string) {
  // key: value but with non-breaking space
  return `${key}:\u00a0${value.replace(/ /g, '\u00a0')}`;
}

export function ReedSummary({ data, lastComment, lastUpdate }: Reed) {
  const information = [];
  if (data.caneProducer) {
    information.push(data.caneProducer);
  }
  if (data.caneDiameter) {
    information.push(keyValue('⌀', data.caneDiameter));
  }

  if (data.caneHardness) {
    information.push(keyValue('hardness', data.caneHardness));
  }

  if (data.caneDensity) {
    information.push(keyValue('density', data.caneDensity));
  }

  if (data.gougeThickness) {
    information.push(keyValue('gouge', data.gougeThickness));
  }

  if (data.shaperForm) {
    information.push(keyValue('shape', data.shaperForm));
  }

  const cane =
    information.length > 0
      ? 'Cane:\u00a0' + information.map((str) => str + '').join(', ') + '.'
      : '';
  const stapleInformation = [];
  if (data.stapleModel) {
    stapleInformation.push(data.stapleModel.replace(/ /g, '\u00a0'));
  }
  if (data.stapleLength) {
    stapleInformation.push(data.stapleLength.replace(/ /g, '\u00a0'));
  }
  const staple =
    stapleInformation.length > 0 ? 'Staple:\u00a0' + stapleInformation.join(',\u00a0') + '.' : '';

  // @ts-expect-error - TS doesn't know about CSS custom properties
  const style: CSSProperties = {
    '--reed-color': findColorHex(data.threadColor),
  };

  return (
    <a href="#" className="reed-summary" style={style}>
      <h2 className="reed-summary__title">{data.reedIdentification}</h2>
      <span className="reed-summary__last-update">
        {timestampToLocaleFormattedDate(lastUpdate)}
      </span>
      <div className="reed-summary__meta">
        {cane} {staple}
      </div>
      <div className="reed-summary__comments">{lastComment}</div>
    </a>
  );
}
