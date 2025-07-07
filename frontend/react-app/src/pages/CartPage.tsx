import React from 'react'
import { useCart } from '../contexts/CartContext'
import { useNavigate } from 'react-router-dom'

const CartPage: React.FC = () => {
  const { items, total, remove, clear } = useCart()
  const nav = useNavigate()

  if (items.length === 0) {
    return <p className="p-6">Košík je prázdný.</p>
  }

  return (
    <div className="p-6 space-y-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Košík</h2>
      {items.map(i => (
        <div key={i.id} className="flex justify-between items-center bg-white p-4 rounded shadow">
          <div>
            <p className="font-semibold">{i.title}</p>
            <p className="text-sm text-gray-600">× {i.qty}</p>
          </div>
          <div className="text-right">
            <p>{(i.price * i.qty).toFixed(2)} Kč</p>
            <button
              onClick={() => remove(i.id)}
              className="text-red-600 hover:underline text-sm"
            >
              Odebrat
            </button>
          </div>
        </div>
      ))}
      <div className="flex justify-between font-bold">
        <span>Celkem:</span><span>{total.toFixed(2)} Kč</span>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => nav('/checkout')}
          className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Zaplatit
        </button>
        <button
          onClick={clear}
          className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
        >
          Smazat košík
        </button>
      </div>
    </div>
  )
}

export default CartPage
