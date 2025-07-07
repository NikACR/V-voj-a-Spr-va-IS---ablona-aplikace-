import React, { useEffect, useState } from 'react'
import api from '../utils/api'

interface Order {
  id_objednavky: number
  stav: string
  cas_pripravy: string
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<Order[]>('/objednavka')
      .then(r => {
        setOrders(r.data)
        setError(null)
      })
      .catch(() => setError('Nepodařilo se načíst objednávky.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Načítám objednávky…</p>
  if (error)   return <p className="text-red-600">{error}</p>

  return (
    <div>
      <h1>Moje objednávky</h1>
      {orders.length === 0 ? (
        <p>Ještě nemáte žádné objednávky.</p>
      ) : (
        orders.map(o => (
          <div key={o.id_objednavky} className="border p-4 rounded mb-4">
            <h2 className="text-lg font-semibold">
              Objednávka č. {o.id_objednavky}
            </h2>
            <p>Status: {o.stav}</p>
            <p>
              Hotovo do:{' '}
              {o.cas_pripravy
                ? new Date(o.cas_pripravy).toLocaleTimeString()
                : '–'}
            </p>
          </div>
        ))
      )}
    </div>
  )
}

export default OrdersPage
