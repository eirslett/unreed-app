import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { ReedState } from '../../types';
import { useReeds } from '../../useReeds/useReeds';

type DataContextType = {
  reeds: ReedState;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function Data({ children }: { children?: ReactNode }) {
  const [reeds, dispatch] = useReeds();

  useEffect(() => {
    console.log('Data mounted');
    fetch('/api/reed_log.php')
      .then((response) => response.json())
      .then((data) => {
        data.forEach(dispatch);
      });
  }, []);

  console.log('now', reeds);

  const data = {
    reeds,
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
