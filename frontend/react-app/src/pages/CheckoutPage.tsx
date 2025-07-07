// src/pages/CheckoutPage.tsx
import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import api from '../utils/api'

const CheckoutPage: React.FC = () => {
  const { items, clear } = useCart()
  const navigate = useNavigate()

  // 1) Celková cena a body za objednávku
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

  // 1b) Odhad doby přípravy – nejdelší položka
  const estimatedPrepTime = useMemo(() => {
    if (!items.length) return 0
    return Math.max(...items.map(it => it.prepTime ?? 0))
  }, [items])

  // 2) Načtení existujících bodů z profilu
  const [accountPoints, setAccountPoints] = useState(0)
  useEffect(() => {
    api
      .get('/users/me/points')
      .then(res => setAccountPoints(res.data.body))
      .catch(() => setAccountPoints(0))
  }, [])

  // 3) Stavy pro platbu a výsledky
  const [method, setMethod] = useState<'cash' | 'card'>('cash')
  const [applyDiscount, setApplyDiscount] = useState(false)
  const [error, setError] = useState('')
  const [paid, setPaid] = useState(false)
  const [paidAmount, setPaidAmount] = useState(0)
  const [earnedPoints, setEarnedPoints] = useState(0)
  const [currentPoints, setCurrentPoints] = useState(0)
  const [prepTime, setPrepTime] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)

  // 4) Výpočet finální ceny pro zobrazení
  const discountedPrice = applyDiscount
    ? Math.max(0, totalPrice - 200)
    : totalPrice

  // 5) Funkce pro odeslání objednávky a platby
  const handlePay = async () => {
    setError('')
    try {
      // vytvoření objednávky
      const objedRes = await api.post('/objednavky', {
        items: items.map(item => ({
          id_menu_polozka: item.id,
          mnozstvi: item.qty ?? 1,
          cena: item.price.toFixed(2),
        })),
        apply_discount: applyDiscount,
      })
      const {
        id_objednavky,
        celkova_castka,
        body_ziskane,
        cas_pripravy,
        discount_amount,
      } = objedRes.data

      // provedení platby
      await api.post('/platba', {
        id_objednavky,
        castka: parseFloat(celkova_castka).toFixed(2),
        typ_platby: method === 'cash' ? 'hotove' : 'kartou',
        datum: new Date().toISOString(),
      })

      // načtení aktuálních bodů (jako na profilu)
      const pointsRes = await api.get('/users/me/points')
      const newPoints = pointsRes.data.body

      // uložení výsledků
      setPaidAmount(parseFloat(celkova_castka))
      setEarnedPoints(body_ziskane)
      setPrepTime(cas_pripravy ?? estimatedPrepTime)
      setDiscountAmount(discount_amount)
      setCurrentPoints(newPoints)

      clear()
      setPaid(true)
    } catch (e: any) {
      console.error(e)
      setError('Došlo k chybě při platbě, zkuste to prosím znovu.')
    }
  }

  // 6) Děkovací obrazovka
  if (paid) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Děkujeme za objednávku!</h2>

        <p className="mb-2">
          Zaplatili jste: <strong>{paidAmount.toFixed(2)} Kč</strong>
        </p>

        {discountAmount > 0 && (
          <p className="mb-2 text-green-600">
            Sleva uplatněná: −{discountAmount} Kč
          </p>
        )}

        <p className="mb-2">
          Objednávka bude hotová za: <strong>{prepTime} minut</strong>
        </p>

        <p className="mb-2">
          Body získané nyní: <strong>{earnedPoints}</strong>
        </p>

        {/* Celkem bodů */}
        <p className="mb-4">
          Celkem bodů: <strong>{currentPoints}</strong>
        </p>

        <button
          onClick={() => navigate('/')}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Domů
        </button>
      </div>
    )
  }

  // 7) Formulář potvrzení platby
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Potvrzení platby</h2>

      <p className="mb-2">
        Celkem:{' '}
        <strong>
          {discountedPrice.toFixed(2)} Kč
          {applyDiscount && (
            <span className="ml-2 text-sm text-gray-500">(−200 Kč sleva)</span>
          )}
        </strong>
      </p>

      <p className="mb-2">
        Body za objednávku: <strong>{totalPoints}</strong>
      </p>

      {/* checkbox pro slevu */}
      {accountPoints >= 400 && (
        <label className="flex items-center mb-4 space-x-2">
          <input
            type="checkbox"
            checked={applyDiscount}
            onChange={() => setApplyDiscount(v => !v)}
          />
          <span>Uplatnit slevu 200 Kč za 400 bodů (máte {accountPoints})</span>
        </label>
      )}

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
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Zaplatit
      </button>
    </div>
  )
}

export default CheckoutPage
