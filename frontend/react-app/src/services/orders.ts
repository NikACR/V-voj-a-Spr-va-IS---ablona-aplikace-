// src/services/orders.ts

export interface Order {
  id_objednavky: number;
  id_zakaznika: number;
  stav: string;
  cas_pripravy: string | null;
  body_ziskane: number;
  // ... ostatní pole podle ObjednavkaSchema
}

const API = process.env.REACT_APP_API_URL;

// načtení všech objednávek
export async function fetchOrders(token: string): Promise<Order[]> {
  // změněno z /api/orders na /api/objednavka
  const res = await fetch(`${API}/api/objednavka`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Nepodařilo se načíst objednávky.');
  }
  return res.json();
}

// načtení jedné objednávky podle ID
export async function fetchOrder(
  id: number,
  token: string
): Promise<Order> {
  // změněno z /api/orders/:id na /api/objednavka/:id
  const res = await fetch(`${API}/api/objednavka/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Objednávka nenalezena.');
  }
  return res.json();
}
