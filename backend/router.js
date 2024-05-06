import { Router } from 'express';
import mysql from 'mysql';

function getConnection() {
  if (process.env.NODE_ENV === 'production') {
    // Establish a connection to the database
    return mysql.createConnection({
      user: process.env.DB_USER, // e.g. 'my-db-user'
      password: process.env.DB_PASS, // e.g. 'my-db-password'
      database: process.env.DB_NAME, // e.g. 'my-database'
      socketPath: '/cloudsql/unreed:europe-north1:unreed-production',
    });
  } else {
    return mysql.createConnection({
      host: '127.0.0.1',
      user: 'unreed',
      password: 'unreed',
      database: 'unreed_proddump',
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

function query(connection, sql, params) {
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
    'SELECT entry_id, entry_timestamp, reed_id, entry_type, data from reed_log WHERE google_profile_id=? ORDER BY entry_timestamp ASC',
    [req.user.email],
    function (error, results) {
      if (error) {
        console.error(error);
        res.status(500).send({ message: 'Something went wrong on the server.' });
        connection.end();
      } else {
        const entries = results.map((row) => {
          return {
            ...row,
            entry_timestamp: parseInt(row.entry_timestamp),
            data: JSON.parse(row.data),
          };
        });
        res.send(entries);
        connection.end();
      }
    },
  );
});

router.post('/api/push', async (req, res) => {
  try {
    const changeRows = req.body;
    withConnection(async (connection) => {
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
              newDocumentState.entry_timestamp,
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

router.get('/api/pull', (req, res) => {
  if (!req.user) {
    res.status(401).send({ message: 'Invalid token.' });
    return;
  }

  const id = req.query.id;
  const updatedAt = parseFloat(req.query.updatedAt);
  const limit = parseInt(req.query.limit);

  withConnection(async (connection) => {
    const results = await query(
      connection,
      'SELECT entry_id, entry_timestamp, reed_id, entry_type, data from reed_log WHERE google_profile_id=? AND (entry_timestamp>? OR entry_timestamp=? AND entry_id>?) ORDER BY entry_timestamp ASC, entry_id ASC LIMIT ?',
      [req.user.email, updatedAt, updatedAt, id, limit],
    );

    const entries = results.map((row) => {
      return {
        ...row,
        entry_timestamp: parseInt(row.entry_timestamp),
        data: JSON.parse(row.data),
      };
    });

    const newCheckpoint =
      entries.length > 0
        ? {
            id: entries[entries.length - 1].entry_id,
            updatedAt: entries[entries.length - 1].entry_timestamp,
          }
        : { id, updatedAt };

    res.send({
      documents: entries,
      checkpoint: newCheckpoint,
    });
  });
});
