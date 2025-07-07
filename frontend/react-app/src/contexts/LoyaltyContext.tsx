import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface LoyaltyContextType {
  points: number;
  addPoints: (p: number) => void;
  redeem: (amount: number) => void;
}

const LoyaltyContext = createContext<LoyaltyContextType | undefined>(undefined);

export const useLoyalty = () => {
  const ctx = useContext(LoyaltyContext);
  if (!ctx) throw new Error('useLoyalty must be used within LoyaltyProvider');
  return ctx;
};

export const LoyaltyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [points, setPoints] = useState<number>(
    () => parseInt(localStorage.getItem('loyaltyPoints') || '0', 10)
  );

  useEffect(() => {
    localStorage.setItem('loyaltyPoints', points.toString());
  }, [points]);

  const addPoints = (p: number) => setPoints(prev => prev + p);
  const redeem = (amount: number) => setPoints(prev => Math.max(0, prev - amount));

  return (
    <LoyaltyContext.Provider value={{ points, addPoints, redeem }}>
      {children}
    </LoyaltyContext.Provider>
  );
};
