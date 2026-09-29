import { useContext } from 'react';
import { AdminAuthContext } from '../context/AdminAuthContext';
import type { AdminAuthContextValue } from '../context/AdminAuthContext';

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used inside an AdminAuthProvider');
  }
  return context;
}
