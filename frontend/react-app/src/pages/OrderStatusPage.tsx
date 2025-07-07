// OrderStatusPage.tsx

import { EventSourcePolyfill } from 'event-source-polyfill';
import { getAccessToken } from '../utils/tokenStorage';

function OrderStatus({ orderId }: { orderId: number }) {
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const es = new EventSourcePolyfill(
      `${process.env.REACT_APP_API_URL}/api/events/objednavka/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // pokud chcete v URL query místo hlavičky:
        // url: `${API}/api/events/objednavka/${orderId}?token=${token}`
      }
    );

    es.addEventListener('update', (e: any) => {
      const data = JSON.parse(e.data);
      console.log('SSE update:', data);
      // tady si aktualizujte stav komponenty
    });

    es.onerror = err => {
      console.error('SSE ERROR', err);
      es.close();
    };

    return () => {
      es.close();
    };
  }, [orderId]);

  return <div>Čekám na aktualizace stavu…</div>;
}
