import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'Admin' | 'Teacher' | 'Student'

export interface User {
  email: string
  role: Role
  name: string
}

interface AuthState {
  user: User | null
  login: (email: string) => void
  logout: () => void
  isAuthenticated: boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (email: string) => {
        let role: Role = 'Student'
        if (email === 'admin@tsec.edu') role = 'Admin'
        else if (email === 'teacher@tsec.edu') role = 'Teacher'

        set({
          user: {
            email,
            role,
            name: email.split('@')[0],
          },
          isAuthenticated: true,
        })
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
