import { createContext, useContext, useState } from 'react'
import { ROLES } from '../data/mockData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('kunp_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (role) => {
    const profile = ROLES[role]
    const fakeJwt = {
      sub: profile.id,
      role,
      institutionId: profile.institutionId,
      institution: profile.institution,
      name: profile.name,
      iat: Date.now(),
    }
    setUser(fakeJwt)
    sessionStorage.setItem('kunp_user', JSON.stringify(fakeJwt))
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem('kunp_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
