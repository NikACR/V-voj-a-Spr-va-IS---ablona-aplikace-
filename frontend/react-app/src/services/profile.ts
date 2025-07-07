// src/services/profile.ts

export interface PointsAccount {
  id_ucet: number;
  id_zakaznika: number;
  body: number;
  datum_zalozeni: string;
}

const API = process.env.REACT_APP_API_URL;

// načte stav bodů na účtu přihlášeného uživatele
export async function fetchPoints(token: string): Promise<PointsAccount> {
  // backend route je /api/users/me/points (pozor na /users/ ...)
  const res = await fetch(`${API}/api/users/me/points`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Nepodařilo se načíst body.');
  }
  return res.json();
}
