import { useReducer } from 'react';
import { LogEntry, ReedState } from '../types';
import { reedReducer } from './reedsReducer';

const initial: ReedState = {
  recentReeds: [],
  discardedReeds: [],
  reeds: {},
};
export function useReeds() {
  return useReducer(reedReducer, initial);
}
