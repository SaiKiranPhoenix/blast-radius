import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

type UIContextValue = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  selectedServiceId: string | null;
  setSelectedServiceId: (value: string | null) => void;
};

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: PropsWithChildren): JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const value = useMemo(
    () => ({ isSidebarOpen, setIsSidebarOpen, selectedServiceId, setSelectedServiceId }),
    [isSidebarOpen, selectedServiceId],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIContextValue {
  const value = useContext(UIContext);
  if (!value) {
    throw new Error('useUI must be used inside UIProvider');
  }
  return value;
}
