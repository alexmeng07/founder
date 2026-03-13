import { createContext, useContext, useState, useCallback } from 'react';

const DemoProfileContext = createContext(null);

const STORAGE_KEY = 'founder_demo_profile';

function loadStoredProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function storeProfile(profile) {
  if (profile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function DemoProfileProvider({ children }) {
  const [savedProfile, setSavedProfileState] = useState(loadStoredProfile);

  const setSavedProfile = useCallback((profile) => {
    setSavedProfileState(profile);
    storeProfile(profile);
  }, []);

  const value = { savedProfile, setSavedProfile };

  return (
    <DemoProfileContext.Provider value={value}>
      {children}
    </DemoProfileContext.Provider>
  );
}

export function useDemoProfile() {
  const ctx = useContext(DemoProfileContext);
  if (!ctx) throw new Error('useDemoProfile must be used within DemoProfileProvider');
  return ctx;
}
