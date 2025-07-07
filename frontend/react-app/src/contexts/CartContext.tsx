import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: number;
  title: string;
  price: number;
  qty: number;
  prepTime: number;   // čas přípravy za kus
  points: number;     // body za kus
}

interface CartContextType {
  items: CartItem[];
  itemsCount: number;
  add: (item: Omit<CartItem, 'qty'>) => void;
  remove: (id: number) => void;
  clear: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = (item: Omit<CartItem, 'qty'>) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i =>
          i.id === item.id
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const remove = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clear = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const itemsCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, itemsCount, add, remove, clear, total }}>
      {children}
    </CartContext.Provider>
  );
};
