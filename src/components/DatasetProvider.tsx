import { type ReactNode } from 'react';
import { DatasetContext, type DatasetContextValue } from '@/hooks/useDatasetContext';
import { useDataset } from '@/hooks/useDataset';

export function DatasetProvider({ children }: { children: ReactNode }) {
  const value = useDataset();
  return <DatasetContext.Provider value={value as DatasetContextValue}>{children}</DatasetContext.Provider>;
}
