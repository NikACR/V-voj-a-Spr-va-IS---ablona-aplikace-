// src/pages/OrderStatus.tsx
import React, { useEffect, useState } from 'react'
import { getAccessToken } from '../utils/tokenStorage'

const OrderStatus: React.FC<{ orderId: number }> = ({ orderId }) => {
  const [status, setStatus] = useState<string>('…')
  const [casPripravy, setCasPripravy] = useState<string | null>(null)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) return

    // SSE konektor s tokenem v query-parametru
    const evtSrc = new EventSource(
      `/api/events/objednavka/${orderId}?token=${token}`
    )

    evtSrc.addEventListener('update', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data)
        setStatus(payload.status)
        setCasPripravy(payload.cas_pripravy)
      } catch {
        console.error('Chyba parsování SSE message', e.data)
      }
    })

    evtSrc.onerror = () => {
      console.warn('SSE connection lost, closing…')
      evtSrc.close()
    }

    return () => {
      evtSrc.close()
    }
  }, [orderId])

  return (
    <div>
      <p>Stav objednávky: {status}</p>
      {casPripravy && <p>Čas přípravy: {casPripravy}</p>}
    </div>
  )
}

export default OrderStatus
