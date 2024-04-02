export type ReedsState = { [reedId: string]: Reed };

interface LogEntryBase {
  entry_id: string;
  entry_type: string;
  entry_timestamp: number;
  reed_id: string;
}

export type ReedType = 'oboe' | 'english-horn';
export interface ReedData {
  reedType: ReedType;
  reedIdentification: string;
  threadColor: string;
  caneProducer: string;
  caneDiameter: string;
  caneHardness: string;
  caneDensity: string;
  gougeThickness: string;
  shaperForm: string;
  stapleModel: string;
  stapleLength: string;
  tiedReedLength: string;
  currentLength: string;
  comments: '';
}
export interface CreateLogEntry extends LogEntryBase {
  entry_type: 'create';
  data: ReedData;
}

interface CommentEntry extends LogEntryBase {
  entry_type: 'comment';
  data: {
    comment: string;
  };
}

interface ScrapeEntry extends LogEntryBase {
  entry_type: 'scrape';
  data: {
    comment: string;
  };
}

interface PlayEntry extends LogEntryBase {
  entry_type: 'play';
  data: {
    comment: string;
    duration: string;
  };
}

interface ClipEntry extends LogEntryBase {
  entry_type: 'clip';
  data: {
    length: string;
  };
}

interface DiscardEntry extends LogEntryBase {
  entry_type: 'discard';
  data: {};
}

export type LogEntry =
  | CreateLogEntry
  | CommentEntry
  | ScrapeEntry
  | PlayEntry
  | ClipEntry
  | DiscardEntry;

export type RecentReedsState = Array<string>;
export type DiscardedReedsState = Array<string>;

interface ReedHistoryBase {
  time: number;
  action: string;
}
interface CreateHistoryEntry extends ReedHistoryBase {
  action: 'create';
  comments: string;
}
interface CommentHistoryEntry extends ReedHistoryBase {
  action: 'comment';
  comments: string;
}
interface ScrapeHistoryEntry extends ReedHistoryBase {
  action: 'scrape';
  comments: string;
}
interface PlayHistoryEntry extends ReedHistoryBase {
  action: 'play';
  duration: string;
  comment: string;
}
interface ClipHistoryEntry extends ReedHistoryBase {
  action: 'clip';
  length: string;
}
interface DiscardHistoryEntry extends ReedHistoryBase {
  action: 'discard';
}
export type ReedHistory =
  | CreateHistoryEntry
  | CommentHistoryEntry
  | ScrapeHistoryEntry
  | PlayHistoryEntry
  | ClipHistoryEntry
  | DiscardHistoryEntry;

interface Reed {
  lastUpdate: number;
  lastComment: string;
  discarded: boolean;
  data: ReedData;
  history: Array<ReedHistory>;
}

export type ReedState = {
  recentReeds: RecentReedsState;
  discardedReeds: DiscardedReedsState;
  reeds: ReedsState;
};
