import { MemoryRouter, RouterProvider, createMemoryRouter } from 'react-router-dom';
import { Reed } from '../../types';
import { ReedSummary } from './ReedSummary';

export default {
  title: 'Reed Summary',
  // decorate with react router memory router
};

export function Example() {
  const reed: Reed = {
    data: {
      reedType: 'oboe',
      reedIdentification: '1',
      threadColor: 'hot pink',
      caneProducer: 'Alliaud',
      caneDiameter: '10.5',
      caneHardness: '12',
      caneDensity: '',
      gougeThickness: '58',
      shaperForm: 'RC12',
      stapleModel: 'Chiarugi',
      stapleLength: '47 mm',
      tiedReedLength: '74 mm',
      currentLength: '72 mm',
      comments: '',
    },
    history: [],
    lastComment: 'last comment',
    lastUpdate: 1713716814,
    discarded: false,
  };

  return <ReedSummary id="" {...reed} />;
}
