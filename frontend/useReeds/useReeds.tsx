import { useReducer } from 'react';
import { LogEntry, ReedState } from '../types';
import { reedReducer } from './reedsReducer';
import { initial } from './initialState';

export function useReeds() {
  return useReducer(reedReducer, initial);
}
