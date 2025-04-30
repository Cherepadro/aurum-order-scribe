
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
  employeeName: string | null;
  workshopAddress: string | null;
  employeeId: string | null;
  workshopId: string | null;
  isAuthenticated: boolean;
  setAuth: (employeeName: string, workshopAddress: string, employeeId: string, workshopId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [employeeName, setEmployeeName] = useState<string | null>(null);
  const [workshopAddress, setWorkshopAddress] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [workshopId, setWorkshopId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Initialize from localStorage
  useEffect(() => {
    const storedEmployeeName = localStorage.getItem("employeeName");
    const storedWorkshopAddress = localStorage.getItem("workshopAddress");
    const storedEmployeeId = localStorage.getItem("employeeId");
    const storedWorkshopId = localStorage.getItem("workshopId");

    if (storedEmployeeName && storedWorkshopAddress && storedEmployeeId && storedWorkshopId) {
      setEmployeeName(storedEmployeeName);
      setWorkshopAddress(storedWorkshopAddress);
      setEmployeeId(storedEmployeeId);
      setWorkshopId(storedWorkshopId);
      setIsAuthenticated(true);
    }
  }, []);

  const setAuth = (name: string, address: string, eId: string, wId: string) => {
    setEmployeeName(name);
    setWorkshopAddress(address);
    setEmployeeId(eId);
    setWorkshopId(wId);
    setIsAuthenticated(true);
    
    localStorage.setItem("employeeName", name);
    localStorage.setItem("workshopAddress", address);
    localStorage.setItem("employeeId", eId);
    localStorage.setItem("workshopId", wId);
  };

  const logout = () => {
    setEmployeeName(null);
    setWorkshopAddress(null);
    setEmployeeId(null);
    setWorkshopId(null);
    setIsAuthenticated(false);
    
    localStorage.removeItem("employeeName");
    localStorage.removeItem("workshopAddress");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("workshopId");
  };

  return (
    <AuthContext.Provider
      value={{
        employeeName,
        workshopAddress,
        employeeId,
        workshopId,
        isAuthenticated,
        setAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
