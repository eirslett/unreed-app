import { createRxDatabase, addRxPlugin, RxDatabase, RxCollection } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { replicateRxCollection } from 'rxdb/plugins/replication';

import { ReactNode, createContext, useContext, useEffect, useRef } from 'react';
import { LogEntry, ReedState } from '../../types';
import { useReeds } from '../../useReeds/useReeds';
import { useUsername } from '../Auth/Auth';

type DataContextType = {
  reeds: ReedState;
  write(entry: LogEntry): void;
};

type DatabaseCollections = {
  entries: RxCollection<LogEntry>;
};
type UnreedDatabase = RxDatabase<DatabaseCollections>;

async function boot({ username }: { username: string }): Promise<UnreedDatabase> {
  // @ts-expect-error DEV is a boolean which comes from Vite
  const isEnv = import.meta.env.DEV;
  if (isEnv) {
    const module = await import('rxdb/plugins/dev-mode');
    addRxPlugin(module.RxDBDevModePlugin);
  }
  addRxPlugin(RxDBQueryBuilderPlugin);

  const database: UnreedDatabase = await createRxDatabase({
    name: makeDatabaseName(username),
    storage: getRxStorageDexie(), // <- RxStorage
  });

  function makeDatabaseName(username: string) {
    let string = username.replace(/@/, '-at-');
    string = string.replace(/\./g, '-dot-');
    string = string.replace(/[^a-z_$0-9-]/g, '-');
    return 'unreed-' + string;
  }

  const schema = {
    title: 'entry schema',
    version: 0,
    primaryKey: 'entry_id',
    type: 'object',
    properties: {
      entry_id: {
        type: 'string',
        maxLength: 36,
      },
      entry_type: {
        type: 'string',
      },
      entry_timestamp: {
        type: 'number',
      },
      reed_id: {
        type: 'string',
        maxLength: 36,
      },
      data: {
        type: 'object',
      },
    },
    indexes: ['reed_id'],
    required: ['entry_id', 'entry_type', 'entry_timestamp', 'reed_id'],
  };

  const collections = await database.addCollections({
    entries: {
      schema,
    },
  });

  const replicationState = await replicateRxCollection({
    collection: collections.entries,
    autoStart: true,
    live: true,
    replicationIdentifier: 'my-http-replication/api/pull',
    push: {
      async handler(changeRows) {
        const rawResponse = await fetch('/api/push', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(changeRows),
        });
        const conflictsArray = await rawResponse.json();
        return conflictsArray;
      },
    },
    pull: {
      async handler(
        checkpointOrNull: { id: string; updatedAt: number } | undefined,
        batchSize: number,
      ) {
        const updatedAt = checkpointOrNull?.updatedAt ?? 0;
        const id = checkpointOrNull?.id ?? '';
        const response = await fetch(
          `/api/pull?updatedAt=${updatedAt}&id=${id}&limit=${batchSize}`,
        );
        const data = await response.json();

        return {
          documents: data.documents,
          checkpoint: data.checkpoint,
        };
      },
    },
  });

  return database;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function Data({ children }: { children?: ReactNode }) {
  const [reeds, dispatch] = useReeds();

  const username = useUsername();

  const dbRef = useRef<Promise<UnreedDatabase> | undefined>(undefined);
  useEffect(() => {
    if (dbRef.current === undefined) {
      dbRef.current = boot({ username });

      dbRef.current.then(async (db: UnreedDatabase) => {
        const query = db.entries.find().sort({ entry_timestamp: 'asc' });
        db.entries
          .find()
          .sort({ entry_timestamp: 'asc' })
          .$.subscribe((changes: LogEntry[]) => {
            dispatch({ entry_type: 'clear' });
            changes.forEach(dispatch);
          });
      });
    }

    return () => {
      // do no cleanup
    };
  }, [username]);

  function write(entry: LogEntry) {
    dbRef.current?.then(async (db: UnreedDatabase) => {
      await db.entries.insert(entry);
    });
  }

  const data = {
    reeds,
    write,
  };

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
