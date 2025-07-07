import { useEffect } from 'react'
import { useNotifications } from '../contexts/NotificationsContext'

export function useOrderEvents(orderId: number) {
  const { addNotification } = useNotifications()

  useEffect(() => {
    const url = `/api/events/objednavka/${orderId}`
    const evtSource = new EventSource(url)

    evtSource.addEventListener(`order-${orderId}`, (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        addNotification(
          `Objednávka ${orderId} změnila stav na "${data.status}". Hotovo do ${new Date(
            data.cas_pripravy
          ).toLocaleTimeString()}.`
        )
      } catch {}
    })

    evtSource.onerror = () => {
      evtSource.close()
    }

    return () => {
      evtSource.close()
    }
  }, [orderId, addNotification])
}
