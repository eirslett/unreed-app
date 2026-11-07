import { Firestore } from '@google-cloud/firestore';

const COLLECTION = 'reed_log';
const SORT_SEP = '\u001f';

export type ReedLogRow = {
  entry_id: string;
  reed_id: string;
  entry_type: string;
  data: unknown;
  entry_timestamp: Date;
  commit_time: Date;
};

type StoredLog = {
  google_profile_id: string;
  entry_timestamp: string;
  reed_id: string;
  entry_type: string;
  data: unknown;
  commit_time: string;
  sort_key: string;
};

let firestore: Firestore | undefined;

export function formatMySQLDatetime(datetime: Date) {
  return datetime.toISOString().replace('T', ' ').replace('Z', '');
}

export function parseMySQLDatetime(value: string) {
  return new Date(`${value.replace(' ', 'T')}Z`);
}

export function sortKey(commitTime: string, entryTimestamp: string, entryId: string) {
  return `${commitTime}${SORT_SEP}${entryTimestamp}${SORT_SEP}${entryId}`;
}

export function setFirestore(db: Firestore) {
  firestore = db;
}

function database() {
  if (firestore === undefined) {
    firestore = new Firestore({
      projectId: 'unreed',
      databaseId: '(default)',
    });
  }
  return firestore;
}

function collection() {
  return database().collection(COLLECTION);
}

function toRow(entryId: string, stored: StoredLog): ReedLogRow {
  return {
    entry_id: entryId,
    entry_timestamp: parseMySQLDatetime(stored.entry_timestamp),
    reed_id: stored.reed_id,
    entry_type: stored.entry_type,
    data: stored.data,
    commit_time: parseMySQLDatetime(stored.commit_time),
  };
}

export async function findExisting(profileId: string, ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  const rows: ReedLogRow[] = [];
  for (let offset = 0; offset < ids.length; offset += 300) {
    const refs = ids.slice(offset, offset + 300).map((id) => collection().doc(id));
    const snaps = await database().getAll(...refs);
    for (const snap of snaps) {
      if (!snap.exists) {
        continue;
      }
      const stored = snap.data() as StoredLog;
      if (stored.google_profile_id !== profileId) {
        continue;
      }
      rows.push(toRow(snap.id, stored));
    }
  }
  return rows;
}

export async function insertLog(entry: {
  entry_id: string;
  google_profile_id: string;
  entry_timestamp: string;
  reed_id: string;
  entry_type: string;
  data: unknown;
}) {
  const commitTime = formatMySQLDatetime(new Date());
  await collection()
    .doc(entry.entry_id)
    .create({
      google_profile_id: entry.google_profile_id,
      entry_timestamp: entry.entry_timestamp,
      reed_id: entry.reed_id,
      entry_type: entry.entry_type,
      data: entry.data,
      commit_time: commitTime,
      sort_key: sortKey(commitTime, entry.entry_timestamp, entry.entry_id),
    });
}

export async function pullLogs(args: {
  profileId: string;
  commitTime: string;
  entryTimestamp: string;
  entryId: string;
  limit: number;
}) {
  const snap = await collection()
    .where('google_profile_id', '==', args.profileId)
    .where('sort_key', '>', sortKey(args.commitTime, args.entryTimestamp, args.entryId))
    .orderBy('sort_key', 'asc')
    .limit(args.limit)
    .get();

  return snap.docs.map((doc) => toRow(doc.id, doc.data() as StoredLog));
}

export async function replaceLogs(
  entries: Array<{
    entry_id: string;
    google_profile_id: string;
    entry_timestamp: string;
    reed_id: string;
    entry_type: string;
    data: unknown;
    commit_time: string;
  }>,
) {
  for (let offset = 0; offset < entries.length; offset += 400) {
    const batch = database().batch();
    for (const entry of entries.slice(offset, offset + 400)) {
      batch.set(collection().doc(entry.entry_id), {
        google_profile_id: entry.google_profile_id,
        entry_timestamp: entry.entry_timestamp,
        reed_id: entry.reed_id,
        entry_type: entry.entry_type,
        data: entry.data,
        commit_time: entry.commit_time,
        sort_key: sortKey(entry.commit_time, entry.entry_timestamp, entry.entry_id),
      });
    }
    await batch.commit();
  }
}

export async function deleteLog(entryId: string) {
  await collection().doc(entryId).delete();
}
