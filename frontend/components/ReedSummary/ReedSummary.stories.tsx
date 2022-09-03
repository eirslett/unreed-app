import { ReedSummary } from './ReedSummary';

export default {
  title: 'Reed Summary',
};

export function Example() {
  return (
    <ReedSummary
      reedType={'oboe'}
      reedIdentification={'1'}
      threadColor={'hotpink'}
      caneProducer={'Alliaud'}
      caneDiameter={'10.5'}
      caneHardness={'12'}
      caneDensity={''}
      gougeThickness={'58'}
      shaperForm={'RC12'}
      stapleModel={'Chiarugi'}
      stapleLength={'47 mm'}
      tiedReedLength={'74 mm'}
    />
  );
}
