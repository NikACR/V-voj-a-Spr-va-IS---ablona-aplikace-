// src/pages/CheckoutPage.tsx
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import api from '../utils/api'

const CheckoutPage: React.FC = () => {
  const { items, clear } = useCart()
  const navigate = useNavigate()

  // 1) Klientské přepočty – cena i body * počet (item.qty)
  const totalPrice = useMemo(
    () =>
      items.reduce((sum, item) => {
        const qty = item.qty ?? 1
        return sum + item.price * qty
      }, 0),
    [items]
  )
  const totalPoints = useMemo(
    () =>
      items.reduce((sum, item) => {
        const qty = item.qty ?? 1
        return sum + item.points * qty
      }, 0),
    [items]
  )

  // 1b) Klientský odhad doby přípravy = pouze nejdelší single položka
  const estimatedPrepTime = useMemo(() => {
    if (items.length === 0) return 0
    return Math.max(...items.map(item => item.prepTime ?? 0))
  }, [items])

  // 2) Stav pro výsledek platby
  const [method, setMethod] = useState<'cash' | 'card'>('cash')
  const [error, setError] = useState<string>('')
  const [paid, setPaid] = useState(false)
  const [paidAmount, setPaidAmount] = useState(0)
  const [earnedPoints, setEarnedPoints] = useState<number | null>(null)
  const [prepTime, setPrepTime] = useState<number | null>(null)

  // 3) Odeslání objednávky + platby
  const handlePay = async () => {
    setError('')
    try {
      // vytvoříme objednávku na backendu
      const objedRes = await api.post('/objednavky', {
        items: items.map(item => ({
          id_menu_polozka: item.id,
          mnozstvi: item.qty,
          cena: item.price.toFixed(2),
        })),
        apply_discount: false,
      })
      const {
        id_objednavky,
        celkova_castka,
        body_ziskane,
        cas_pripravy, // backend nyní vrací počet minut, nebo null
      } = objedRes.data

      // provedeme platbu
      await api.post('/platba', {
        id_objednavky,
        castka: parseFloat(celkova_castka).toFixed(2),
        typ_platby: method === 'cash' ? 'hotove' : 'kartou',
        datum: new Date().toISOString(),
      })

      // uložíme výsledky
      setPaidAmount(parseFloat(celkova_castka))
      setEarnedPoints(body_ziskane)
      // pokud backend neposlal cas_pripravy, použij náš odhad single položky
      setPrepTime(cas_pripravy != null ? cas_pripravy : estimatedPrepTime)

      clear()
      setPaid(true)
    } catch (e: any) {
      console.error(e)
      setError('Došlo k chybě při platbě, zkuste to prosím znovu.')
    }
  }

  // 4) Zobrazení výsledků po zaplacení
  if (paid) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Děkujeme za objednávku!</h2>
        <p className="mb-2">
          Zaplatili jste: <strong>{paidAmount.toFixed(2)} Kč</strong>
        </p>
        {prepTime !== null && (
          <p className="mb-2">
            Objednávka bude hotová za: <strong>{prepTime} minut</strong>
          </p>
        )}
        {earnedPoints !== null && (
          <p className="mb-4">
            Body: <strong>{earnedPoints}</strong>
          </p>
        )}
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Domů
        </button>
      </div>
    )
  }

  // 5) Formulář před platbou
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Potvrzení platby</h2>

      <p className="mb-2">
        Celkem: <strong>{totalPrice.toFixed(2)} Kč</strong>
      </p>
      <p className="mb-2">
        Body: <strong>{totalPoints}</strong>
      </p>
      <p className="mb-4">
        Odhad přípravy: <strong>{estimatedPrepTime} minut</strong>
      </p>
      {error && <p className="mb-4 text-red-600">{error}</p>}

      <div className="mb-4 space-y-2">
        <label className="flex items-center">
          <input
            type="radio"
            name="payment"
            checked={method === 'cash'}
            onChange={() => setMethod('cash')}
            className="mr-2"
          />
          Hotově na místě
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="payment"
            checked={method === 'card'}
            onChange={() => setMethod('card')}
            className="mr-2"
          />
          Kartou online
        </label>
      </div>

      <button
        onClick={handlePay}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Zaplatit
      </button>
    </div>
  )
}

export default CheckoutPage
