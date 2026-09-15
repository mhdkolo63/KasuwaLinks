import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { APP_CONFIG } from '@/constants/config';

interface AppContextValue {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  locations: readonly string[];
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<string>(
    APP_CONFIG.initialLocation.city
  );

  const value: AppContextValue = {
    selectedLocation,
    setSelectedLocation,
    locations: APP_CONFIG.locations,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
