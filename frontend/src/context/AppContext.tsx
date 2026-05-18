'use client';
import React, { createContext, useContext } from 'react';
import type { Company } from '@/types';

interface AppContextValue {
  companies: Company[];
  companyById: Record<string, Company>;
  totalCount: number;
}

const AppContext = createContext<AppContextValue>({
  companies: [],
  companyById: {},
  totalCount: 0,
});

export const useApp = () => useContext(AppContext);
export const AppProvider = AppContext.Provider;
