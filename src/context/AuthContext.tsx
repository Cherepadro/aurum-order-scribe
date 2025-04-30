
import React, { createContext, useState, useContext, ReactNode } from 'react';

type AuthContextType = {
  employeeName: string | null;
  workshopAddress: string | null;
  setAuth: (employee: string | null, workshop: string | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [employeeName, setEmployeeName] = useState<string | null>(
    sessionStorage.getItem('employeeName')
  );
  const [workshopAddress, setWorkshopAddress] = useState<string | null>(
    sessionStorage.getItem('workshopAddress')
  );

  const setAuth = (employee: string | null, workshop: string | null) => {
    if (employee) {
      sessionStorage.setItem('employeeName', employee);
      setEmployeeName(employee);
    }
    if (workshop) {
      sessionStorage.setItem('workshopAddress', workshop);
      setWorkshopAddress(workshop);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('employeeName');
    sessionStorage.removeItem('workshopAddress');
    setEmployeeName(null);
    setWorkshopAddress(null);
  };

  return (
    <AuthContext.Provider
      value={{
        employeeName,
        workshopAddress,
        setAuth,
        isAuthenticated: !!(employeeName && workshopAddress),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
