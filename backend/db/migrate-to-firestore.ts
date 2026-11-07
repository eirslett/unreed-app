import fs from 'fs';
import mysql from 'mysql2/promise';
import { formatMySQLDatetime, replaceLogs } from './reed-log.ts';
import { useGcloudFirestore } from './firestore-auth.ts';

type MysqlLogRow = {
  entry_id: string;
  google_profile_id: string;
  entry_timestamp: Date;
  reed_id: string;
  entry_type: string;
  data: unknown;
  commit_time: Date;
};

const secretPath = process.env.UNREED_SECRET_FILE;
if (secretPath === undefined) {
  throw new Error('Set UNREED_SECRET_FILE to the JSON file with DB_USER, DB_PASS, and DB_NAME');
}

const secret = JSON.parse(fs.readFileSync(secretPath, 'utf8')) as {
  DB_USER: string;
  DB_PASS: string;
  DB_NAME: string;
};

const port = process.env.MYSQL_PORT !== undefined ? parseInt(process.env.MYSQL_PORT) : 3307;
const connection = await mysql.createConnection({
  host: '127.0.0.1',
  port,
  user: secret.DB_USER,
  password: secret.DB_PASS,
  database: secret.DB_NAME,
  timezone: 'Z',
});

const [rows] = await connection.query(
  'SELECT entry_id, google_profile_id, entry_timestamp, reed_id, entry_type, data, commit_time FROM reed_log',
);
await connection.end();

const logRows = rows as MysqlLogRow[];
useGcloudFirestore();
await replaceLogs(
  logRows.map((row) => ({
    entry_id: row.entry_id,
    google_profile_id: row.google_profile_id,
    entry_timestamp: formatMySQLDatetime(row.entry_timestamp),
    reed_id: row.reed_id,
    entry_type: row.entry_type,
    data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
    commit_time: formatMySQLDatetime(row.commit_time),
  })),
);

console.log(`Copied ${logRows.length} rows from MySQL. Cloud SQL was not modified.`);
