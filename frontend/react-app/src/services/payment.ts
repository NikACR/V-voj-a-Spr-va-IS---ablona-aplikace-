// src/services/platba.ts

export interface PaymentRequest {
  castka: number;
  metoda: 'card' | 'paypal' | string;
}

export interface PaymentResponse {
  id: number;
  zakaznik_id: number;
  castka: number;
  metoda: string;
  created_at: string;
}

const API = process.env.REACT_APP_API_URL;

export async function createPayment(
  token: string,
  data: PaymentRequest
): Promise<PaymentResponse> {
  // voláme českou routu /api/platba
  const res = await fetch(`${API}/api/platba`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.msg || 'Platba selhala');
  }
  return res.json();
}
