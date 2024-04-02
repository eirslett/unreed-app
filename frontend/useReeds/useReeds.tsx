import { useReducer } from 'react';
import { LogEntry, ReedState } from '../types';
import { reedReducer } from './reedsReducer';

const initial: ReedState = {
  recentReeds: [],
  discardedReeds: [],
  reeds: {},
};
export function useReeds(): ReedState {
  const [state, dispatch] = useReducer(reedReducer, initial);
  return state;
}
