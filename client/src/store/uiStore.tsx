import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

type UIContextValue = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  selectedServiceId: string | null;
  setSelectedServiceId: (value: string | null) => void;
  /** 0 = nothing done, 1 = scenario chosen, 2 = hops inspected, 3 = teams reviewed, 4 = plan copied */
  firstRunStep: number;
  setFirstRunStep: (step: number) => void;
};

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: PropsWithChildren): JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [firstRunStep, setFirstRunStep] = useState<number>(0);

  const value = useMemo(
    () => ({
      isSidebarOpen,
      setIsSidebarOpen,
      selectedServiceId,
      setSelectedServiceId,
      firstRunStep,
      setFirstRunStep,
    }),
    [isSidebarOpen, selectedServiceId, firstRunStep],
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
