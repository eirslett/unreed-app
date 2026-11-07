import fs from 'fs';
import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';
import * as jose from 'jose';
import {
  deleteLog,
  findExisting,
  formatMySQLDatetime,
  insertLog,
  pullLogs,
  sortKey,
} from './reed-log.ts';
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

function stable(value: unknown): string {
  return JSON.stringify(value, (_, nested) => {
    if (nested instanceof Date) {
      return formatMySQLDatetime(nested);
    }
    if (nested !== null && typeof nested === 'object' && !Array.isArray(nested)) {
      const sorted: Record<string, unknown> = {};
      for (const key of Object.keys(nested).sort()) {
        sorted[key] = (nested as Record<string, unknown>)[key];
      }
      return sorted;
    }
    return nested;
  });
}

const secretPath = process.env.UNREED_SECRET_FILE;
if (secretPath === undefined) {
  throw new Error('Set UNREED_SECRET_FILE to the JSON file with DB_USER, DB_PASS, and DB_NAME');
}

const secret = JSON.parse(fs.readFileSync(secretPath, 'utf8')) as {
  DB_USER: string;
  DB_PASS: string;
  DB_NAME: string;
  JWKS: { private: jose.JWK };
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

const [loaded] = await connection.query(
  `SELECT entry_id, google_profile_id, entry_timestamp, reed_id, entry_type, data, commit_time,
          DATE_FORMAT(entry_timestamp, '%Y-%m-%d %H:%i:%s.%f') AS entry_sql,
          DATE_FORMAT(commit_time, '%Y-%m-%d %H:%i:%s.%f') AS commit_sql
   FROM reed_log
   ORDER BY commit_time ASC, entry_timestamp ASC, entry_id ASC`,
);
await connection.end();

type ComparedRow = MysqlLogRow & { entry_sql: string; commit_sql: string };
const mysqlRows = loaded as ComparedRow[];

for (const row of mysqlRows) {
  const entryFormatted = formatMySQLDatetime(row.entry_timestamp);
  const commitFormatted = formatMySQLDatetime(row.commit_time);
  if (
    entryFormatted !== row.entry_sql.slice(0, 23) ||
    commitFormatted !== row.commit_sql.slice(0, 23)
  ) {
    throw new Error(`Datetime format mismatch for ${row.entry_id}`);
  }
}

const byUser = new Map<string, ComparedRow[]>();
for (const row of mysqlRows) {
  const list = byUser.get(row.google_profile_id) ?? [];
  list.push(row);
  byUser.set(row.google_profile_id, list);
}

useGcloudFirestore();

let compared = 0;
for (const [profileId, expected] of byUser) {
  const actual = [];
  let commitTime = '1000-01-01 00:00:00.000';
  let entryTimestamp = '1000-01-01 00:00:00.000';
  let entryId = '';

  for (;;) {
    const page = await pullLogs({
      profileId,
      commitTime,
      entryTimestamp,
      entryId,
      limit: 100,
    });
    actual.push(...page);
    if (page.length < 100) {
      break;
    }
    const last = page[page.length - 1];
    commitTime = formatMySQLDatetime(last.commit_time);
    entryTimestamp = formatMySQLDatetime(last.entry_timestamp);
    entryId = last.entry_id;
  }

  if (actual.length !== expected.length) {
    throw new Error(
      `Row count mismatch for a user: MySQL ${expected.length}, Firestore ${actual.length}`,
    );
  }

  for (let i = 0; i < expected.length; i++) {
    const mysqlRow = expected[i];
    const firestoreRow = actual[i];
    const mysqlData = typeof mysqlRow.data === 'string' ? JSON.parse(mysqlRow.data) : mysqlRow.data;
    const mysqlComparable = {
      entry_id: mysqlRow.entry_id,
      entry_timestamp: formatMySQLDatetime(mysqlRow.entry_timestamp),
      reed_id: mysqlRow.reed_id,
      entry_type: mysqlRow.entry_type,
      data: mysqlData,
      commit_time: formatMySQLDatetime(mysqlRow.commit_time),
      sort_key: sortKey(
        formatMySQLDatetime(mysqlRow.commit_time),
        formatMySQLDatetime(mysqlRow.entry_timestamp),
        mysqlRow.entry_id,
      ),
    };
    const firestoreComparable = {
      entry_id: firestoreRow.entry_id,
      entry_timestamp: formatMySQLDatetime(firestoreRow.entry_timestamp),
      reed_id: firestoreRow.reed_id,
      entry_type: firestoreRow.entry_type,
      data: firestoreRow.data,
      commit_time: formatMySQLDatetime(firestoreRow.commit_time),
      sort_key: sortKey(
        formatMySQLDatetime(firestoreRow.commit_time),
        formatMySQLDatetime(firestoreRow.entry_timestamp),
        firestoreRow.entry_id,
      ),
    };
    if (stable(mysqlComparable) !== stable(firestoreComparable)) {
      throw new Error(`Row mismatch at position ${i} for entry ${mysqlRow.entry_id}`);
    }
  }
  compared += actual.length;
}

console.log(
  `Verified ${compared} rows across ${byUser.size} users. Order, timestamps, and JSON match MySQL.`,
);

const probeId = `migration-probe-${randomUUID()}`;
const probeProfile = 'migration-probe@unreed.invalid';
try {
  await insertLog({
    entry_id: probeId,
    google_profile_id: probeProfile,
    entry_timestamp: '2026-11-07 22:00:00.000',
    reed_id: probeId,
    entry_type: 'comment',
    data: { comment: 'migration probe' },
  });
  const found = await findExisting(probeProfile, [probeId]);
  const pulled = await pullLogs({
    profileId: probeProfile,
    commitTime: '1000-01-01 00:00:00.000',
    entryTimestamp: '1000-01-01 00:00:00.000',
    entryId: '',
    limit: 10,
  });
  if (found.length !== 1 || pulled.some((row) => row.entry_id === probeId) === false) {
    throw new Error('Push and pull of a probe document failed');
  }
  const conflict = await findExisting(probeProfile, [probeId, randomUUID()]);
  if (conflict.length !== 1 || conflict[0].entry_id !== probeId) {
    throw new Error('Conflict lookup did not return the probe document');
  }
} finally {
  await deleteLog(probeId);
}

const leftover = await findExisting(probeProfile, [probeId]);
if (leftover.length !== 0) {
  throw new Error('Probe document was not deleted');
}
console.log('Push, conflict lookup, pull, and delete of a probe document succeeded.');

const productionBaseUrl = process.env.PRODUCTION_BASE_URL;
if (productionBaseUrl !== undefined) {
  const privateKey = await jose.importJWK(secret.JWKS.private, 'ES256');
  for (const [profileId, expected] of byUser) {
    const jwt = await new jose.SignJWT({ email: profileId })
      .setProtectedHeader({ alg: 'ES256' })
      .setIssuedAt()
      .setIssuer('urn:unreed-prod:issuer')
      .setAudience('urn:unreed-prod:audience')
      .setExpirationTime('10m')
      .sign(privateKey);

    const documents = [];
    let checkpoint: { id: string; commitTime: string; entryTimestamp: string } | undefined;
    for (;;) {
      const url = new URL('/api/pull', productionBaseUrl);
      url.searchParams.set('limit', '100');
      url.searchParams.set('id', checkpoint?.id ?? '');
      if (checkpoint !== undefined) {
        url.searchParams.set('commit_time', checkpoint.commitTime);
        url.searchParams.set('entry_timestamp', checkpoint.entryTimestamp);
      }
      const response = await fetch(url, {
        headers: { Cookie: `UNREED_OIDC_TOKEN=${jwt}` },
      });
      if (!response.ok) {
        throw new Error(`Production pull failed with HTTP ${response.status}`);
      }
      const body = (await response.json()) as {
        documents: Array<{
          entry_id: string;
          entry_timestamp: string;
          reed_id: string;
          entry_type: string;
          data: unknown;
          commit_time: string;
        }>;
        checkpoint: { id: string; commitTime: string; entryTimestamp: string };
      };
      documents.push(...body.documents);
      if (body.documents.length < 100) {
        break;
      }
      checkpoint = body.checkpoint;
    }

    if (documents.length !== expected.length) {
      throw new Error(
        `Production pull count mismatch: MySQL ${expected.length}, HTTP ${documents.length}`,
      );
    }
    for (let i = 0; i < expected.length; i++) {
      const mysqlRow = expected[i];
      const httpRow = documents[i];
      const mysqlData =
        typeof mysqlRow.data === 'string' ? JSON.parse(mysqlRow.data) : mysqlRow.data;
      const sameRow =
        httpRow.entry_id === mysqlRow.entry_id &&
        httpRow.reed_id === mysqlRow.reed_id &&
        httpRow.entry_type === mysqlRow.entry_type &&
        formatMySQLDatetime(new Date(httpRow.entry_timestamp)) ===
          formatMySQLDatetime(mysqlRow.entry_timestamp) &&
        formatMySQLDatetime(new Date(httpRow.commit_time)) ===
          formatMySQLDatetime(mysqlRow.commit_time) &&
        stable(httpRow.data) === stable(mysqlData);
      if (!sameRow) {
        throw new Error(`Production pull mismatch at ${mysqlRow.entry_id}`);
      }
    }
  }
  console.log(`Production /api/pull matched MySQL for ${byUser.size} users.`);
}
