import { faker } from '@faker-js/faker';
import mysql from 'mysql';

const entries = [];
let lastUpdate = Date.now();
function makeTime() {
  const diff = Math.random() * 1000 * 60 * 60 * 24;
  lastUpdate -= diff;
  return Math.floor(lastUpdate / 1000);
}

const email = 'test.user@example.com';

for (let i = 100; i > 0; i--) {
  const id = faker.string.uuid();

  const tiedReedLength = faker.datatype.number({ min: 71, max: 75, precision: 0.5 });
  const cutLength = tiedReedLength - faker.datatype.number({ min: 0.5, max: 3, precision: 0.5 });

  if (faker.number.int({ min: 0, max: 100 }) < 20) {
    const discardEntry = {
      entry_id: faker.string.uuid(),
      google_profile_id: email,
      entry_timestamp: makeTime(),
      reed_id: id,
      entry_type: 'discard',
      data: JSON.stringify({}),
    };
    entries.push(discardEntry);
  }

  const commentEntry = {
    entry_id: faker.string.uuid(),
    google_profile_id: email,
    entry_timestamp: makeTime(),
    reed_id: id,
    entry_type: 'comment',
    data: JSON.stringify({
      comment: faker.git.commitMessage(),
    }),
  };
  entries.push(commentEntry);

  const scrapeEntry = {
    entry_id: faker.string.uuid(),
    google_profile_id: email,
    entry_timestamp: makeTime(),
    reed_id: id,
    entry_type: 'scrape',
    data: JSON.stringify({
      comment: faker.git.commitMessage(),
    }),
  };
  entries.push(scrapeEntry);

  const playEntry = {
    entry_id: faker.string.uuid(),
    google_profile_id: email,
    entry_timestamp: makeTime(),
    reed_id: id,
    entry_type: 'play',
    data: JSON.stringify({
      duration: faker.datatype.number({ min: 15, max: 90, precision: 15 }) + ' min',
      comment: faker.git.commitMessage(),
    }),
  };
  entries.push(playEntry);

  const cutEntry = {
    entry_id: faker.string.uuid(),
    google_profile_id: email,
    entry_timestamp: makeTime(),
    reed_id: id,
    entry_type: 'clip',
    data: JSON.stringify({ length: cutLength + ' mm' }),
  };

  const createEntry = {
    entry_id: faker.string.uuid(),
    google_profile_id: email,
    entry_timestamp: makeTime(),
    reed_id: id,
    entry_type: 'create',
    data: JSON.stringify({
      reedType: 'oboe',
      reedIdentification: '#' + i,
      threadColor: faker.helpers.arrayElement([
        'coconut',
        'latte',
        'mustard',
        'ginger',
        'scarlet',
        'watermelon',
        'sangria',
        'azure',
        'moss',
        'syrup',
        'slate',
        'raven',
      ]),
      caneProducer: faker.helpers.arrayElement([
        'Rigotti',
        'Alliaud',
        'Marca',
        'Ghys',
        'Silvacane',
        'Güner',
        'Glotin',
      ]),
      caneDiameter: faker.helpers.arrayElement(['11 mm', '10.5 mm', '10 mm', '9.5 mm']),
      caneHardness: faker.helpers.arrayElement([
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
      ]),
      caneDensity: '',
      gougeThickness: faker.helpers.arrayElement([
        '56 mm',
        '57 mm',
        '58 mm',
        '59 mm',
        '60 mm',
        '56-58 mm',
        '58-60 mm',
      ]),
      shaperForm: faker.helpers.arrayElement([
        '-1N',
        'Berlin',
        'Oslo',
        'Glotin',
        'H 117',
        'Klopfer 730',
        'Mack',
        'Oslo',
        'LM 5',
        'Diana',
        'Müller',
        'RC 2',
      ]),
      stapleModel: faker.helpers.arrayElement([
        'Apollon',
        'Chiarugi 2',
        'Chiarugi 5',
        'Eterion',
        'Ludwig Frank',
        'Glotin',
        'Gualco',
        'Klopfer',
        'Lorée',
        'Marigaux 2',
      ]),
      stapleLength: faker.helpers.arrayElement(['45 mm', '46 mm', '47 mm']),
      tiedReedLength: tiedReedLength + ' mm',
      comments: faker.git.commitMessage(),
    }),
  };

  entries.push(cutEntry, createEntry);
}

entries.reverse();

console.log(entries);

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'unreed',
  password: 'unreed',
  database: 'unreed',
});
connection.connect();

connection.query('DELETE FROM reed_log');

for (const entry of entries) {
  await new Promise((resolve, reject) => {
    connection.query(
      'INSERT INTO reed_log (entry_id, google_profile_id, entry_timestamp, reed_id, entry_type, data) VALUES (?, ?, ?, ?, ?, ?)',
      [
        entry.entry_id,
        entry.google_profile_id,
        entry.entry_timestamp,
        entry.reed_id,
        entry.entry_type,
        entry.data,
      ],
      function (error, results) {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          console.log('Inserted test entry into the database.');
          resolve();
        }
      },
    );
  });
}

connection.end();
