// src/contexts/NotificationsContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react'

export type Notification = {
  id: number
  message: string
  timestamp: Date
  read: boolean
}

type NotificationsContextType = {
  notifications: Notification[]
  addNotification: (message: string) => void
  markAsRead: (id: number) => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

let nextNotificationId = 1

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (message: string) => {
    const newNotif: Notification = {
      id: nextNotificationId++,
      message,
      timestamp: new Date(),
      read: false,
    }
    setNotifications(prev => [newNotif, ...prev])
  }

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  return (
    <NotificationsContext.Provider value={{ notifications, addNotification, markAsRead }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
