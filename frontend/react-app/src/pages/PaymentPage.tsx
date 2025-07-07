import React, { useState, useContext } from 'react';
import { createPayment } from '../services/payments';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext'; // kde držíš token
import { PointsContext } from '../context/PointsContext'; // kde držíš body

export const PaymentPage: React.FC = () => {
  const [castka, setCastka] = useState(0);
  const [loading, setLoading] = useState(false);
  const { token } = useContext(AuthContext);
  const { setPoints } = useContext(PointsContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payment = await createPayment(token, { castka, metoda: 'card' });
      toast.success(`Úspěšně zaplaceno ${payment.castka} Kč.`);
      // teď si přepočti nové body – můžeš zavolat /api/users/me nebo mít body v headeru
      // pokud backend vrátí nové body, použij to místo dalšího fetch
      const earned = Math.floor(payment.castka / 10);
      setPoints(prev => prev + earned);
      toast.info(`Získáno ${earned} bodů.`);
    } catch (err: any) {
      toast.error(`Platba selhala: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Částka (Kč):
        <input
          type="number"
          min="1"
          value={castka}
          onChange={e => setCastka(Number(e.target.value))}
          required
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Probíhá…' : 'Zaplaceno'}
      </button>
    </form>
  );
};
