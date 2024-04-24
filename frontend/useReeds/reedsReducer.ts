import {
  ReedData,
  ReedState,
  DiscardedReedsState,
  LogEntry,
  RecentReedsState,
  ReedsState,
} from '../types';
import { initial } from './initialState';

export type ClearAction = { entry_type: 'clear' };

export function reedReducer(state: ReedState, action: LogEntry | ClearAction): ReedState {
  if (action.entry_type === 'clear') {
    return initial;
  } else {
    return {
      ...state,
      recentReeds: recentReedsReducer(state.recentReeds, action),
      reeds: reedsReducer(state.reeds, action),
    };
  }
}

export function recentReedsReducer(recent: RecentReedsState, logEntry: LogEntry): RecentReedsState {
  const filtered = recent.filter((id) => logEntry.reed_id !== id);
  if (logEntry.entry_type === 'discard') {
    return filtered;
  }
  return [logEntry.reed_id, ...filtered];
}

export function discardedReedsReducer(
  discarded: DiscardedReedsState,
  logEntry: LogEntry,
): DiscardedReedsState {
  if (logEntry.entry_type === 'discard') {
    const filtered = discarded.filter((id) => logEntry.reed_id !== id);
    return [logEntry.reed_id, ...filtered];
  }
  return discarded;
}

export function reedsReducer(reeds: ReedsState, logEntry: LogEntry): ReedsState {
  switch (logEntry.entry_type) {
    case 'create':
      return {
        ...reeds,
        [logEntry.reed_id]: {
          lastUpdate: logEntry.entry_timestamp,
          lastComment: logEntry.data.comments,
          discarded: false,
          data: {
            ...logEntry.data,
            reedType: logEntry.data.reedType ?? 'oboe',
            currentLength: logEntry.data.tiedReedLength,
          },
          history: [
            {
              time: logEntry.entry_timestamp,
              action: 'create',
              comments: logEntry.data.comments,
            },
          ],
        },
      };
    case 'comment':
      if (!reeds[logEntry.reed_id]) {
        console.log('missing data for reed', logEntry.reed_id);
      }
      return {
        ...reeds,
        [logEntry.reed_id]: {
          ...reeds[logEntry.reed_id],
          lastUpdate: logEntry.entry_timestamp,
          lastComment: logEntry.data.comment,
          history: [
            {
              time: logEntry.entry_timestamp,
              action: 'comment',
              comments: logEntry.data.comment,
            },
            ...reeds[logEntry.reed_id].history,
          ],
        },
      };
    case 'scrape':
      return {
        ...reeds,
        [logEntry.reed_id]: {
          ...reeds[logEntry.reed_id],
          lastUpdate: logEntry.entry_timestamp,
          history: [
            {
              time: logEntry.entry_timestamp,
              action: 'scrape',
              comments: logEntry.data.comment,
            },
            ...reeds[logEntry.reed_id].history,
          ],
        },
      };
    case 'play':
      return {
        ...reeds,
        [logEntry.reed_id]: {
          ...reeds[logEntry.reed_id],
          lastUpdate: logEntry.entry_timestamp,
          lastComment: logEntry.data.comment,
          history: [
            {
              time: logEntry.entry_timestamp,
              action: 'play',
              duration: logEntry.data.duration,
              comment: logEntry.data.comment,
            },
            ...reeds[logEntry.reed_id].history,
          ],
        },
      };
    case 'clip':
      return {
        ...reeds,
        [logEntry.reed_id]: {
          ...reeds[logEntry.reed_id],
          lastUpdate: logEntry.entry_timestamp,
          data: {
            ...reeds[logEntry.reed_id].data,
            currentLength: logEntry.data.length,
          },
          history: [
            {
              time: logEntry.entry_timestamp,
              action: 'clip',
              length: logEntry.data.length,
            },
            ...reeds[logEntry.reed_id].history,
          ],
        },
      };
    case 'discard':
      return {
        ...reeds,
        [logEntry.reed_id]: {
          ...reeds[logEntry.reed_id],
          lastUpdate: logEntry.entry_timestamp,
          discarded: true,
          data: {
            ...reeds[logEntry.reed_id].data,
          },
          history: [
            {
              time: logEntry.entry_timestamp,
              action: 'discard',
            },
            ...reeds[logEntry.reed_id].history,
          ],
        },
      };
    default:
      return reeds;
  }
}
