import { Reed } from '../../types';
import { ReedPage } from './ReedPage';

export default {
  title: 'Reed Page',
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
    history: [
      { time: '2024-05-08T22:53:11.000', action: 'comment', comments: 'index 1080p panel' },
      {
        time: '2024-05-08T22:53:11.000',
        action: 'scrape',
        comments: 'synthesize mobile bandwidth',
      },
      {
        time: '2024-05-08T22:53:11.000',
        action: 'play',
        duration: '75 min',
        comment: 'synthesize auxiliary sensor',
      },
      { time: '2024-05-08T22:53:11.000', action: 'clip', length: '73 mm' },
      {
        time: '2024-05-08T22:53:11.000',
        action: 'create',
        comments: 'input solid state protocol',
      },
    ],
    lastComment: 'last comment',
    lastUpdate: '2024-05-08T22:53:11.000',
    discarded: false,
  };

  return <ReedPage reed={reed} addComment={console.log} />;
}
