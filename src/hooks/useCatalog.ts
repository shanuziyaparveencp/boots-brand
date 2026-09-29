import { useContext } from 'react';
import { CatalogContext } from '../context/CatalogContext';
import type { CatalogContextValue } from '../context/CatalogContext';

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used inside a CatalogProvider');
  }
  return context;
}
