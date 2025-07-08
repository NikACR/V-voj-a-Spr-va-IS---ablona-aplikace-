// src/contexts/NotificationsContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { fetchNotifications, ServerNotification } from '../utils/api'

export interface Notification {
  id: number
  typ: string
  text: string
  timestamp: Date
  read: boolean
}

interface NotificationsContextValue {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: number) => void
  markAllAsRead: () => void
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined)

export const NotificationsProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    fetchNotifications()
      .then(serverNotifs => {
        const mapped = serverNotifs.map(n => ({
          id:        n.id_notifikace,
          typ:       n.typ,
          text:      n.text,
          timestamp: new Date(n.datum_cas),
          read:      false
        }))
        setNotifications(mapped)
      })
      .catch(err => {
        console.error('Chyba při načítání notifikací:', err)
      })
  }, [])

  const markAsRead = (id: number) => {
    setNotifications(nots =>
      nots.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(nots =>
      nots.map(n => ({ ...n, read: true }))
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export const useNotifications = (): NotificationsContextValue => {
  const ctx = useContext(NotificationsContext)
  if (!ctx) {
    throw new Error('useNotifications musí být zavoláno v rámci NotificationsProvider')
  }
  return ctx
}
