import { Router } from 'express';
import mysql from 'mysql';
import { parseISO } from 'date-fns';

function getConnection() {
  if (process.env.NODE_ENV === 'production') {
    // Establish a connection to the database
    return mysql.createConnection({
      user: process.env.DB_USER, // e.g. 'my-db-user'
      password: process.env.DB_PASS, // e.g. 'my-db-password'
      database: process.env.DB_NAME, // e.g. 'my-database'
      timezone: 'Z', // Very important for sync to work correctly
      socketPath: '/cloudsql/unreed:europe-north1:unreed-production',
    });
  } else {
    return mysql.createConnection({
      host: '127.0.0.1',
      user: 'unreed',
      password: 'unreed',
      database: 'unreed_proddump',
      timezone: 'Z', // Very important for sync to work correctly
    });
  }
}

async function withConnection(callback) {
  const connection = getConnection();
  connection.connect();
  try {
    return await callback(connection);
  } finally {
    connection.end();
  }
}

async function query(connection, sql, params) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, function (error, results) {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

export const router = new Router();

router.get('/api/reed_log.php', (req, res) => {
  if (!req.user) {
    res.status(401).send({ message: 'Invalid token.' });
    return;
  }

  const connection = getConnection();

  connection.connect();
  connection.query(
    'SELECT entry_id, entry_timestamp, reed_id, entry_type, data, commit_time from reed_log WHERE google_profile_id=? ORDER BY entry_timestamp ASC',
    [req.user.email],
    function (error, results) {
      if (error) {
        console.error(error);
        res.status(500).send({ message: 'Something went wrong on the server.' });
        connection.end();
      } else {
        const entries = results.map(
          (
            // Pick out commit_time from the entry
            { commit_time, ...row },
          ) => {
            return {
              ...row,
              data: JSON.parse(row.data),
            };
          },
        );
        res.send(entries);
        connection.end();
      }
    },
  );
});

router.post('/api/push', async (req, res) => {
  try {
    const changeRows = req.body;
    await withConnection(async (connection) => {
      const conflicts = [];

      const ids = changeRows.map((row) => row.newDocumentState.entry_id);
      const existingEntries = await query(
        connection,
        'select entry_id, entry_timestamp, reed_id, entry_type, data from reed_log where google_profile_id=? and entry_id in (?)',
        [req.user.email, ids],
      );

      for (const { entry_id, entry_timestamp, reed_id, entry_type, data } of existingEntries) {
        conflicts.push({
          entry_id,
          entry_timestamp,
          reed_id,
          entry_type,
          data: JSON.parse(data),
        });
      }

      for (const { assumedMasterState, newDocumentState } of changeRows) {
        if (existingEntries.some((row) => row.entry_id === newDocumentState.entry_id)) {
          continue;
        } else {
          const insertResult = await query(
            connection,
            'INSERT INTO reed_log (entry_id, google_profile_id, entry_timestamp, reed_id, entry_type, data) VALUES (?, ?, ?, ?, ?, ?)',
            [
              newDocumentState.entry_id,
              req.user.email,
              formatMySQLDatetime(parseISO(newDocumentState.entry_timestamp)),
              newDocumentState.reed_id,
              newDocumentState.entry_type,
              JSON.stringify(newDocumentState.data),
            ],
          );
          console.log(
            'Inserted new row (' +
              newDocumentState.entry_id +
              '), affected rows: ' +
              insertResult.affectedRows,
          );
        }
      }

      res.send(conflicts);
    });
  } catch (error) {
    console.error('Could not sync state to server', error);
    res.status(500).json({ title: 'Sync error', detail: 'Could not sync state to server' });
  }
});

function formatMySQLDatetime(datetime) {
  return datetime.toISOString().replace('T', ' ').replace('Z', '');
}

router.get('/api/pull', async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).send({ title: 'Unauthorized', detail: 'Invalid token.' });
      return;
    }

    const id = req.query.id;
    let commitTime = req.query.commit_time ?? '1000-01-01 00:00:00.000';
    let entryTimestamp = req.query.entry_timestamp ?? '1000-01-01 00:00:00.000';

    const limit = parseInt(req.query.limit);

    await withConnection(async (connection) => {
      const queryString = `
      SELECT
        entry_id, entry_timestamp, reed_id, entry_type, data, commit_time
      from
        reed_log
      WHERE
        google_profile_id=?
        AND (
          commit_time>?
          OR commit_time=? AND entry_timestamp>?
          OR commit_time=? AND entry_timestamp=? AND entry_id>?
        )
      ORDER BY commit_time ASC, entry_timestamp ASC, entry_id ASC
      LIMIT ?`;

      const results = await query(connection, queryString, [
        req.user.email,
        commitTime,
        commitTime,
        entryTimestamp,
        commitTime,
        entryTimestamp,
        id,
        limit,
      ]);

      const entries = results.map(
        (
          // Pick out commit_time from the entry
          { commit_time, ...row },
        ) => {
          return {
            ...row,
            commit_time,
            data: JSON.parse(row.data),
          };
        },
      );

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
    });
  } catch (error) {
    console.error('Could not sync state from server', error);
    res.status(500).json({ title: 'Sync error', detail: 'Could not pull state from server' });
  }
});
