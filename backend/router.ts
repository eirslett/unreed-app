import { Router } from 'express';
import { parseISO } from 'date-fns';
import { findExisting, formatMySQLDatetime, insertLog, pullLogs } from './db/reed-log.ts';

export const router = Router();

// This is what's accepted by the server, and what's also returned to the client
interface LogEntryBase {
  entry_id: string;
  entry_type: string;
  entry_timestamp: string;
  reed_id: string;
  data: Record<string, unknown>;
}

router.post('/api/push', async (req, res) => {
  try {
    const user = req.user;
    if (user === undefined) {
      res.status(401).send({ title: 'Unauthorized', detail: 'Invalid token.' });
      return;
    }

    const changeRows = req.body as [{ assumedMasterState: any; newDocumentState: LogEntryBase }];
    const conflicts = [];

    const ids = changeRows.map((row) => row.newDocumentState.entry_id);
    const existingEntries = await findExisting(user.email, ids);

    for (const { entry_id, entry_timestamp, reed_id, entry_type, data } of existingEntries) {
      console.log('Looks like a conflict?', {
        entry_id,
        entry_timestamp,
        reed_id,
        entry_type,
        data,
      });

      conflicts.push({
        entry_id,
        entry_timestamp,
        reed_id,
        entry_type,
        data,
      });
    }

    for (const { newDocumentState } of changeRows) {
      if (existingEntries.some((row) => row.entry_id === newDocumentState.entry_id)) {
        continue;
      }
      await insertLog({
        entry_id: newDocumentState.entry_id,
        google_profile_id: user.email,
        entry_timestamp: formatMySQLDatetime(parseISO(newDocumentState.entry_timestamp)),
        reed_id: newDocumentState.reed_id,
        entry_type: newDocumentState.entry_type,
        data: newDocumentState.data,
      });
    }

    res.send(conflicts);
  } catch (error) {
    console.error('Could not sync state to server', error);
    res.status(500).json({ title: 'Sync error', detail: 'Could not sync state to server' });
  }
});

router.get('/api/pull', async (req, res) => {
  try {
    const user = req.user;
    if (user === undefined) {
      res.status(401).send({ title: 'Unauthorized', detail: 'Invalid token.' });
      return;
    }

    const id = typeof req.query.id === 'string' ? req.query.id : '';
    const commitTime =
      typeof req.query.commit_time === 'string' ? req.query.commit_time : '1000-01-01 00:00:00.000';
    const entryTimestamp =
      typeof req.query.entry_timestamp === 'string'
        ? req.query.entry_timestamp
        : '1000-01-01 00:00:00.000';

    const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 100;

    const results = await pullLogs({
      profileId: user.email,
      commitTime,
      entryTimestamp,
      entryId: id,
      limit,
    });

    const entries = results.map(({ commit_time, ...row }) => {
      return {
        ...row,
        commit_time,
        data: row.data,
      };
    });

    const newCheckpoint =
      results.length > 0
        ? {
            id: results[results.length - 1].entry_id,
            commitTime: formatMySQLDatetime(results[results.length - 1].commit_time),
            entryTimestamp: formatMySQLDatetime(results[results.length - 1].entry_timestamp),
          }
        : { id, commitTime, entryTimestamp };

    res.send({
      documents: entries,
      checkpoint: newCheckpoint,
    });
  } catch (error) {
    console.error('Could not sync state from server', error);
    res.status(500).json({ title: 'Sync error', detail: 'Could not pull state from server' });
  }
});
